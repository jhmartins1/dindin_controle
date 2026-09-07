import { NextResponse } from 'next/server';

import { validarSessao } from '../../../src/lib/auth';
import { prisma } from '../../../src/lib/prisma';

const CATEGORIAS_VALIDAS = [
    'INGREDIENTES',
    'EMBALAGENS',
    'TRANSPORTE',
    'OUTROS',
] as const;

type Categoria =
    (typeof CATEGORIAS_VALIDAS)[number];

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

        const descricao =
            String(
                body.descricao ?? '',
            ).trim();

        const valor =
            Number(body.valor);

        const categoria =
            String(
                body.categoria ?? '',
            ) as Categoria;

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

        const gasto =
            await prisma.gasto.create({
                data: {
                    descricao,
                    valor,
                    categoria,
                },
            });

        return NextResponse.json(
            {
                mensagem:
                    'Gasto registrado com sucesso.',
                gasto,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error(
            'Erro ao registrar gasto:',
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