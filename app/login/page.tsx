'use client';

import { IceCreamBowl } from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErro('');
        setCarregando(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login,
                    senha,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.erro ?? 'Usuário ou senha inválidos.');
                return;
            }

            window.location.href = '/dashboard';
        } catch (error) {
            console.error(error);

            setErro('Não foi possível realizar o login.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                        <IceCreamBowl className="h-8 w-8 text-pink-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-zinc-900">
                        Dindin Controle
                    </h1>

                    <p className="mt-2 text-center text-sm text-zinc-500">
                        Entre para acessar o controle da loja
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label
                            htmlFor="login"
                            className="mb-2 block text-sm font-medium text-zinc-700"
                        >
                            Usuário
                        </label>

                        <input
                            id="login"
                            type="text"
                            value={login}
                            onChange={(event) => setLogin(event.target.value)}
                            placeholder="Digite seu usuário"
                            autoComplete="username"
                            required
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="senha"
                            className="mb-2 block text-sm font-medium text-zinc-700"
                        >
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)}
                            placeholder="Digite sua senha"
                            autoComplete="current-password"
                            required
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        />
                    </div>

                    {erro && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {erro}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {carregando ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </main>
    );
}