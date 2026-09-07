import { NextResponse } from 'next/server';

import { validarSessao } from '../../../src/lib/auth';
import { prisma } from '../../../src/lib/prisma';

const FORMAS_PAGAMENTO_VALIDAS = [
    'PIX',
    'DINHEIRO',
    'CARTAO',
] as const;

type FormaPagamento =
    (typeof FORMAS_PAGAMENTO_VALIDAS)[number];

interface ItemRecebido {
    produtoId: number;
    quantidade: number;
}

export async function POST(
    request: Request,
) {
    try {
        const autenticado =
            await validarSessao();

        if (!autenticado) {
            return NextResponse.json(
                {
                    erro: 'Não autorizado.',
                },
                {
                    status: 401,
                },
            );
        }

        const body =
            await request.json();

        const formaPagamento =
            String(
                body.formaPagamento ?? '',
            ) as FormaPagamento;

        const itensRecebidos =
            Array.isArray(body.itens)
                ? body.itens
                : [];

        if (
            !FORMAS_PAGAMENTO_VALIDAS.includes(
                formaPagamento,
            )
        ) {
            return NextResponse.json(
                {
                    erro: 'Forma de pagamento inválida.',
                },
                {
                    status: 400,
                },
            );
        }

        if (
            itensRecebidos.length === 0
        ) {
            return NextResponse.json(
                {
                    erro: 'Selecione pelo menos um produto.',
                },
                {
                    status: 400,
                },
            );
        }

        const itens: ItemRecebido[] = [];

        for (
            const item
            of itensRecebidos
        ) {
            const produtoId =
                Number(
                    item.produtoId,
                );

            const quantidade =
                Number(
                    item.quantidade,
                );

            if (
                !Number.isInteger(
                    produtoId,
                ) ||
                produtoId <= 0
            ) {
                return NextResponse.json(
                    {
                        erro: 'Produto inválido.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (
                !Number.isInteger(
                    quantidade,
                ) ||
                quantidade <= 0
            ) {
                return NextResponse.json(
                    {
                        erro: 'Quantidade inválida.',
                    },
                    {
                        status: 400,
                    },
                );
            }

            itens.push({
                produtoId,
                quantidade,
            });
        }

        const idsProdutos =
            [
                ...new Set(
                    itens.map(
                        (item) =>
                            item.produtoId,
                    ),
                ),
            ];

        const produtos =
            await prisma.produto.findMany({
                where: {
                    id: {
                        in: idsProdutos,
                    },

                    ativo: true,
                },
            });

        if (
            produtos.length !==
            idsProdutos.length
        ) {
            return NextResponse.json(
                {
                    erro: 'Um ou mais produtos não foram encontrados ou estão desativados.',
                },
                {
                    status: 400,
                },
            );
        }

        const produtosMap =
            new Map(
                produtos.map(
                    (produto) => [
                        produto.id,
                        produto,
                    ],
                ),
            );

        const itensNormalizados =
            itens.map((item) => {
                const produto =
                    produtosMap.get(
                        item.produtoId,
                    );

                if (!produto) {
                    throw new Error(
                        'PRODUTO_NAO_ENCONTRADO',
                    );
                }

                return {
                    produtoId:
                        produto.id,

                    quantidade:
                        item.quantidade,

                    precoUnitario:
                        Number(
                            produto.preco,
                        ),
                };
            });

        const total =
            itensNormalizados.reduce(
                (
                    acumulado,
                    item,
                ) =>
                    acumulado +
                    item.precoUnitario *
                    item.quantidade,
                0,
            );

        const venda =
            await prisma.$transaction(
                async (tx) => {
                    for (
                        const item
                        of itensNormalizados
                    ) {
                        const atualizacao =
                            await tx.produto.updateMany({
                                where: {
                                    id:
                                        item.produtoId,

                                    ativo: true,

                                    estoque: {
                                        gte:
                                            item.quantidade,
                                    },
                                },

                                data: {
                                    estoque: {
                                        decrement:
                                            item.quantidade,
                                    },
                                },
                            });

                        if (
                            atualizacao.count !==
                            1
                        ) {
                            throw new Error(
                                'ESTOQUE_INSUFICIENTE',
                            );
                        }
                    }

                    return tx.venda.create({
                        data: {
                            total,
                            formaPagamento,

                            itens: {
                                create:
                                    itensNormalizados.map(
                                        (
                                            item,
                                        ) => ({
                                            produtoId:
                                                item.produtoId,

                                            quantidade:
                                                item.quantidade,

                                            precoUnitario:
                                                item.precoUnitario,
                                        }),
                                    ),
                            },
                        },

                        include: {
                            itens: {
                                include: {
                                    produto:
                                        true,
                                },
                            },
                        },
                    });
                },
            );

        return NextResponse.json(
            {
                mensagem:
                    'Venda registrada com sucesso.',
                venda,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error(
            'Erro ao registrar venda:',
            error,
        );

        if (
            error instanceof Error
        ) {
            if (
                error.message ===
                'ESTOQUE_INSUFICIENTE'
            ) {
                return NextResponse.json(
                    {
                        erro: 'Estoque insuficiente para um dos produtos.',
                    },
                    {
                        status: 409,
                    },
                );
            }

            if (
                error.message ===
                'PRODUTO_NAO_ENCONTRADO'
            ) {
                return NextResponse.json(
                    {
                        erro: 'Produto não encontrado.',
                    },
                    {
                        status: 404,
                    },
                );
            }
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