import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({
        mensagem: 'Logout realizado com sucesso.',
    });

    response.cookies.set({
        name: 'dindin_session',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    return response;
}