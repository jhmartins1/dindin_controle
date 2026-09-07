import { cookies } from 'next/headers';

export async function validarSessao() {
    const cookieStore = await cookies();

    const session =
        cookieStore.get('dindin_session');

    const sessionToken =
        process.env.SESSION_TOKEN;

    if (!sessionToken) {
        throw new Error(
            'SESSION_TOKEN não configurado.',
        );
    }

    return (
        session?.value === sessionToken
    );
}