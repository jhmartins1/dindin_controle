'use client';

import {
    Eye,
    EyeOff,
    IceCreamBowl,
    LoaderCircle,
    LockKeyhole,
    UserRound,
} from 'lucide-react';

import {
    FormEvent,
    useState,
} from 'react';

export default function LoginPage() {
    const [login, setLogin] =
        useState('');

    const [senha, setSenha] =
        useState('');

    const [
        mostrarSenha,
        setMostrarSenha,
    ] = useState(false);

    const [
        carregando,
        setCarregando,
    ] = useState(false);

    const [erro, setErro] =
        useState('');

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setErro('');
        setCarregando(true);

        try {
            const response =
                await fetch(
                    '/api/login',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',
                        },

                        body: JSON.stringify({
                            login,
                            senha,
                        }),
                    },
                );

            const data =
                await response.json();

            if (!response.ok) {
                setErro(
                    data.erro ??
                    'Usuário ou senha inválidos.',
                );

                return;
            }

            window.location.href =
                '/dashboard';
        } catch (error) {
            console.error(error);

            setErro(
                'Não foi possível realizar o login.',
            );
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-pink-50 to-zinc-100 px-4 py-10">
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-rose-300/20 blur-3xl" />

            <div className="relative w-full max-w-md">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/20">
                        <IceCreamBowl
                            size={38}
                            strokeWidth={2}
                            className="text-white"
                        />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                        Dindin Gourmet
                    </h1>

                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-500">
                        Controle suas vendas,
                        estoque e gastos de forma
                        simples.
                    </p>
                </div>

                <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl shadow-zinc-900/5 backdrop-blur sm:p-8">
                    <div className="mb-7">
                        <h2 className="text-xl font-bold text-zinc-900">
                            Bem-vindo
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Entre com seus dados
                            para acessar o sistema.
                        </p>
                    </div>

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="login"
                                className="mb-2 block text-sm font-semibold text-zinc-700"
                            >
                                Usuário
                            </label>

                            <div className="relative">
                                <UserRound
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                                />

                                <input
                                    id="login"
                                    type="text"
                                    value={
                                        login
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setLogin(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Digite seu usuário"
                                    autoComplete="username"
                                    required
                                    disabled={
                                        carregando
                                    }
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3.5 pl-11 pr-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="senha"
                                className="mb-2 block text-sm font-semibold text-zinc-700"
                            >
                                Senha
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                                />

                                <input
                                    id="senha"
                                    type={
                                        mostrarSenha
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        senha
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setSenha(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Digite sua senha"
                                    autoComplete="current-password"
                                    required
                                    disabled={
                                        carregando
                                    }
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3.5 pl-11 pr-12 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarSenha(
                                            (
                                                valor,
                                            ) =>
                                                !valor,
                                        )
                                    }
                                    disabled={
                                        carregando
                                    }
                                    title={
                                        mostrarSenha
                                            ? 'Ocultar senha'
                                            : 'Mostrar senha'
                                    }
                                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
                                >
                                    {mostrarSenha ? (
                                        <EyeOff
                                            size={
                                                18
                                            }
                                        />
                                    ) : (
                                        <Eye
                                            size={
                                                18
                                            }
                                        />
                                    )}
                                </button>
                            </div>
                        </div>

                        {erro && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                {erro}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={
                                carregando
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-pink-600 to-rose-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                        >
                            {carregando && (
                                <LoaderCircle
                                    size={19}
                                    className="animate-spin"
                                />
                            )}

                            {carregando
                                ? 'Entrando...'
                                : 'Entrar'}
                        </button>
                    </form>
                </div>

                <div className="mt-5 text-center">
                    <p className="text-xs text-zinc-400">
                        Sistema de controle interno
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                        Made by:{' '}
                        <a
                            href="https://www.instagram.com/jh.martins1/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-pink-500 transition hover:text-pink-600 hover:underline"
                        >
                            0xJHM
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}