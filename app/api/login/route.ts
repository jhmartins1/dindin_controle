import { NextResponse } from 'next/server';

import { prisma } from '../../../src/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { login, senha } = body;

        if (!login || !senha) {
            return NextResponse.json(
                {
                    erro: 'Usuário e senha são obrigatórios.',
                },
                {
                    status: 400,
                }
            );
        }

        const usuario = await prisma.usuario.findUnique({
            where: {
                login,
            },
        });

        if (!usuario) {
            return NextResponse.json(
                {
                    erro: 'Usuário ou senha inválidos.',
                },
                {
                    status: 401,
                }
            );
        }

        if (usuario.senha !== senha) {
            return NextResponse.json(
                {
                    erro: 'Usuário ou senha inválidos.',
                },
                {
                    status: 401,
                }
            );
        }

        const sessionToken = process.env.SESSION_TOKEN;

        if (!sessionToken) {
            console.error('SESSION_TOKEN não configurado.');

            return NextResponse.json(
                {
                    erro: 'Erro de configuração do servidor.',
                },
                {
                    status: 500,
                }
            );
        }

        const response = NextResponse.json({
            mensagem: 'Login realizado com sucesso.',
            usuario: {
                id: usuario.id,
                login: usuario.login,
            },
        });

        response.cookies.set({
            name: 'dindin_session',
            value: sessionToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.error('Erro no login:', error);

        return NextResponse.json(
            {
                erro: 'Erro interno do servidor.',
            },
            {
                status: 500,
            }
        );
    }
}