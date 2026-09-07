import { NextResponse } from 'next/server';

import { prisma } from '../../../src/lib/prisma';

export async function POST(request: Request) {
    try {
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

        const produto = await prisma.produto.create({
            data: {
                nome,
                preco,
                estoque,
            },
        });

        return NextResponse.json(
            {
                mensagem: 'Produto cadastrado com sucesso.',
                produto,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);

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