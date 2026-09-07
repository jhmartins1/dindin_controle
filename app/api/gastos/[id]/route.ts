import { NextResponse } from 'next/server';

import { validarSessao } from '../../../../src/lib/auth';
import { prisma } from '../../../../src/lib/prisma';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

const CATEGORIAS_VALIDAS = [
    'INGREDIENTES',
    'EMBALAGENS',
    'TRANSPORTE',
    'OUTROS',
] as const;

type CategoriaGasto =
    (typeof CATEGORIAS_VALIDAS)[number];

async function verificarSessao() {
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

    return null;
}

export async function GET(
    request: Request,
    context: RouteContext,
) {
    try {
        const erroSessao =
            await verificarSessao();

        if (erroSessao) {
            return erroSessao;
        }

        const { id } =
            await context.params;

        const gastoId =
            Number(id);

        if (
            !Number.isInteger(gastoId) ||
            gastoId <= 0
        ) {
            return NextResponse.json(
                {
                    erro: 'ID do gasto inválido.',
                },
                {
                    status: 400,
                },
            );
        }

        const gasto =
            await prisma.gasto.findUnique({
                where: {
                    id: gastoId,
                },
            });

        if (!gasto) {
            return NextResponse.json(
                {
                    erro: 'Gasto não encontrado.',
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            gasto,
        });
    } catch (error) {
        console.error(
            'Erro ao buscar gasto:',
            error,
        );

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

export async function PUT(
    request: Request,
    context: RouteContext,
) {
    try {
        const erroSessao =
            await verificarSessao();

        if (erroSessao) {
            return erroSessao;
        }

        const { id } =
            await context.params;

        const gastoId =
            Number(id);

        if (
            !Number.isInteger(gastoId) ||
            gastoId <= 0
        ) {
            return NextResponse.json(
                {
                    erro: 'ID do gasto inválido.',
                },
                {
                    status: 400,
                },
            );
        }

        const body =
            await request.json();

        const descricao =
            String(
                body.descricao ?? '',
            ).trim();

        const valor =
            Number(body.valor);

        const categoria =
            String(
                body.categoria ?? '',
            ) as CategoriaGasto;

        if (!descricao) {
            return NextResponse.json(
                {
                    erro: 'Informe a descrição do gasto.',
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !Number.isFinite(valor) ||
            valor <= 0
        ) {
            return NextResponse.json(
                {
                    erro: 'Informe um valor válido.',
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !CATEGORIAS_VALIDAS.includes(
                categoria,
            )
        ) {
            return NextResponse.json(
                {
                    erro: 'Categoria inválida.',
                },
                {
                    status: 400,
                },
            );
        }

        const gastoExistente =
            await prisma.gasto.findUnique({
                where: {
                    id: gastoId,
                },
            });

        if (!gastoExistente) {
            return NextResponse.json(
                {
                    erro: 'Gasto não encontrado.',
                },
                {
                    status: 404,
                },
            );
        }

        const gasto =
            await prisma.gasto.update({
                where: {
                    id: gastoId,
                },

                data: {
                    descricao,
                    valor,
                    categoria,
                },
            });

        return NextResponse.json({
            mensagem:
                'Gasto atualizado com sucesso.',
            gasto,
        });
    } catch (error) {
        console.error(
            'Erro ao atualizar gasto:',
            error,
        );

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

export async function DELETE(
    request: Request,
    context: RouteContext,
) {
    try {
        const erroSessao =
            await verificarSessao();

        if (erroSessao) {
            return erroSessao;
        }

        const { id } =
            await context.params;

        const gastoId =
            Number(id);

        if (
            !Number.isInteger(gastoId) ||
            gastoId <= 0
        ) {
            return NextResponse.json(
                {
                    erro: 'ID do gasto inválido.',
                },
                {
                    status: 400,
                },
            );
        }

        const gastoExistente =
            await prisma.gasto.findUnique({
                where: {
                    id: gastoId,
                },
            });

        if (!gastoExistente) {
            return NextResponse.json(
                {
                    erro: 'Gasto não encontrado.',
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.gasto.delete({
            where: {
                id: gastoId,
            },
        });

        return NextResponse.json({
            mensagem:
                'Gasto excluído com sucesso.',
        });
    } catch (error) {
        console.error(
            'Erro ao excluir gasto:',
            error,
        );

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