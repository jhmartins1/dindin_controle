import { NextResponse } from 'next/server';

import { prisma } from '../../../src/lib/prisma';

type FormaPagamento = 'PIX' | 'DINHEIRO' | 'CARTAO';

interface ItemRecebido {
    produtoId: number;
    quantidade: number;
}

interface BodyVenda {
    formaPagamento: FormaPagamento;
    itens: ItemRecebido[];
}

const FORMAS_PAGAMENTO: FormaPagamento[] = [
    'PIX',
    'DINHEIRO',
    'CARTAO',
];

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as BodyVenda;

        const { formaPagamento, itens } = body;

        if (!FORMAS_PAGAMENTO.includes(formaPagamento)) {
            return NextResponse.json(
                {
                    erro: 'Forma de pagamento inválida.',
                },
                {
                    status: 400,
                },
            );
        }

        if (!Array.isArray(itens) || itens.length === 0) {
            return NextResponse.json(
                {
                    erro: 'Adicione pelo menos um produto à venda.',
                },
                {
                    status: 400,
                },
            );
        }

        for (const item of itens) {
            if (
                !Number.isInteger(item.produtoId) ||
                !Number.isInteger(item.quantidade) ||
                item.quantidade <= 0
            ) {
                return NextResponse.json(
                    {
                        erro: 'Existem itens inválidos na venda.',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        const idsProdutos = [
            ...new Set(itens.map((item) => item.produtoId)),
        ];

        const produtos = await prisma.produto.findMany({
            where: {
                id: {
                    in: idsProdutos,
                },
                ativo: true,
            },
        });

        if (produtos.length !== idsProdutos.length) {
            return NextResponse.json(
                {
                    erro: 'Um ou mais produtos não foram encontrados.',
                },
                {
                    status: 400,
                },
            );
        }

        let total = 0;

        for (const item of itens) {
            const produto = produtos.find(
                (produto) => produto.id === item.produtoId,
            );

            if (!produto) {
                return NextResponse.json(
                    {
                        erro: 'Produto não encontrado.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (produto.estoque < item.quantidade) {
                return NextResponse.json(
                    {
                        erro: `Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque}.`,
                    },
                    {
                        status: 400,
                    },
                );
            }

            total += Number(produto.preco) * item.quantidade;
        }

        const venda = await prisma.$transaction(
            async (tx) => {
                // Fazemos uma segunda validação do estoque dentro
                // da transação antes de descontar.
                for (const item of itens) {
                    const produtoAtual = await tx.produto.findUnique({
                        where: {
                            id: item.produtoId,
                        },
                    });

                    if (
                        !produtoAtual ||
                        !produtoAtual.ativo ||
                        produtoAtual.estoque < item.quantidade
                    ) {
                        throw new Error('ESTOQUE_INSUFICIENTE');
                    }
                }

                const novaVenda = await tx.venda.create({
                    data: {
                        total,
                        formaPagamento,
                        itens: {
                            create: itens.map((item) => {
                                const produto = produtos.find(
                                    (produto) =>
                                        produto.id === item.produtoId,
                                )!;

                                return {
                                    produtoId: item.produtoId,
                                    quantidade: item.quantidade,
                                    precoUnitario: produto.preco,
                                };
                            }),
                        },
                    },
                    include: {
                        itens: true,
                    },
                });

                for (const item of itens) {
                    await tx.produto.update({
                        where: {
                            id: item.produtoId,
                        },
                        data: {
                            estoque: {
                                decrement: item.quantidade,
                            },
                        },
                    });
                }

                return novaVenda;
            },
        );

        return NextResponse.json(
            {
                mensagem: 'Venda registrada com sucesso.',
                venda,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('Erro ao registrar venda:', error);

        if (
            error instanceof Error &&
            error.message === 'ESTOQUE_INSUFICIENTE'
        ) {
            return NextResponse.json(
                {
                    erro: 'O estoque de um produto mudou. Verifique as quantidades e tente novamente.',
                },
                {
                    status: 409,
                },
            );
        }

        return NextResponse.json(
            {
                erro: 'Erro interno do servidor.',
            },
            {
                status: 500,
            },
        );
    }
}