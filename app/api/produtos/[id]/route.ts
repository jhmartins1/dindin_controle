import { NextResponse } from 'next/server';

import { prisma } from '../../../../src/lib/prisma';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    request: Request,
    context: RouteContext,
) {
    try {
        const { id } = await context.params;

        const produtoId = Number(id);

        if (!Number.isInteger(produtoId)) {
            return NextResponse.json(
                {
                    erro: 'Produto inválido.',
                },
                {
                    status: 400,
                },
            );
        }

        const produto = await prisma.produto.findUnique({
            where: {
                id: produtoId,
            },
        });

        if (!produto) {
            return NextResponse.json(
                {
                    erro: 'Produto não encontrado.',
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            produto,
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);

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
        const { id } = await context.params;

        const produtoId = Number(id);

        if (!Number.isInteger(produtoId)) {
            return NextResponse.json(
                {
                    erro: 'Produto inválido.',
                },
                {
                    status: 400,
                },
            );
        }

        const body = await request.json();

        const nome = String(body.nome ?? '').trim();
        const preco = Number(body.preco);
        const estoque = Number(body.estoque);

        if (!nome) {
            return NextResponse.json(
                {
                    erro: 'O nome do produto é obrigatório.',
                },
                {
                    status: 400,
                },
            );
        }

        if (!Number.isFinite(preco) || preco <= 0) {
            return NextResponse.json(
                {
                    erro: 'Informe um preço válido.',
                },
                {
                    status: 400,
                },
            );
        }

        if (!Number.isInteger(estoque) || estoque < 0) {
            return NextResponse.json(
                {
                    erro: 'Informe um estoque válido.',
                },
                {
                    status: 400,
                },
            );
        }

        const produtoExistente = await prisma.produto.findUnique({
            where: {
                id: produtoId,
            },
        });

        if (!produtoExistente) {
            return NextResponse.json(
                {
                    erro: 'Produto não encontrado.',
                },
                {
                    status: 404,
                },
            );
        }

        const produto = await prisma.produto.update({
            where: {
                id: produtoId,
            },
            data: {
                nome,
                preco,
                estoque,
            },
        });

        return NextResponse.json({
            mensagem: 'Produto atualizado com sucesso.',
            produto,
        });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);

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

export async function PATCH(
    request: Request,
    context: RouteContext,
) {
    try {
        const { id } = await context.params;

        const produtoId = Number(id);

        if (!Number.isInteger(produtoId)) {
            return NextResponse.json(
                {
                    erro: 'Produto inválido.',
                },
                {
                    status: 400,
                },
            );
        }

        const body = await request.json();

        const quantidade = Number(body.quantidade);

        if (
            !Number.isInteger(quantidade) ||
            quantidade <= 0
        ) {
            return NextResponse.json(
                {
                    erro: 'Informe uma quantidade válida.',
                },
                {
                    status: 400,
                },
            );
        }

        const produtoExistente = await prisma.produto.findUnique({
            where: {
                id: produtoId,
            },
        });

        if (!produtoExistente) {
            return NextResponse.json(
                {
                    erro: 'Produto não encontrado.',
                },
                {
                    status: 404,
                },
            );
        }

        const produto = await prisma.produto.update({
            where: {
                id: produtoId,
            },
            data: {
                estoque: {
                    increment: quantidade,
                },
            },
        });

        return NextResponse.json({
            mensagem: 'Estoque atualizado com sucesso.',
            produto,
        });
    } catch (error) {
        console.error('Erro ao adicionar estoque:', error);

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