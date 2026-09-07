import { NextResponse } from 'next/server';

import { validarSessao } from '../../../../../src/lib/auth';
import { prisma } from '../../../../../src/lib/prisma';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(
    request: Request,
    context: RouteContext,
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

        const { id } =
            await context.params;

        const vendaId =
            Number(id);

        if (
            !Number.isInteger(vendaId) ||
            vendaId <= 0
        ) {
            return NextResponse.json(
                {
                    erro: 'ID da venda inválido.',
                },
                {
                    status: 400,
                },
            );
        }

        const resultado =
            await prisma.$transaction(
                async (tx) => {
                    const venda =
                        await tx.venda.findUnique({
                            where: {
                                id: vendaId,
                            },

                            include: {
                                itens: true,
                            },
                        });

                    if (!venda) {
                        throw new Error(
                            'VENDA_NAO_ENCONTRADA',
                        );
                    }

                    if (venda.cancelada) {
                        throw new Error(
                            'VENDA_JA_CANCELADA',
                        );
                    }

                    const atualizacao =
                        await tx.venda.updateMany({
                            where: {
                                id: vendaId,
                                cancelada: false,
                            },

                            data: {
                                cancelada: true,
                                canceladaEm:
                                    new Date(),
                            },
                        });

                    if (
                        atualizacao.count !==
                        1
                    ) {
                        throw new Error(
                            'VENDA_JA_CANCELADA',
                        );
                    }

                    for (
                        const item
                        of venda.itens
                    ) {
                        await tx.produto.update({
                            where: {
                                id:
                                    item.produtoId,
                            },

                            data: {
                                estoque: {
                                    increment:
                                        item.quantidade,
                                },
                            },
                        });
                    }

                    return venda;
                },
            );

        return NextResponse.json({
            mensagem:
                'Venda cancelada e estoque devolvido com sucesso.',

            vendaId:
                resultado.id,
        });
    } catch (error) {
        console.error(
            'Erro ao cancelar venda:',
            error,
        );

        if (
            error instanceof Error
        ) {
            if (
                error.message ===
                'VENDA_NAO_ENCONTRADA'
            ) {
                return NextResponse.json(
                    {
                        erro: 'Venda não encontrada.',
                    },
                    {
                        status: 404,
                    },
                );
            }

            if (
                error.message ===
                'VENDA_JA_CANCELADA'
            ) {
                return NextResponse.json(
                    {
                        erro: 'Essa venda já foi cancelada.',
                    },
                    {
                        status: 409,
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