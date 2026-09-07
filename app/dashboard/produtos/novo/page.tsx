'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function NovoProdutoPage() {
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [estoque, setEstoque] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErro('');
        setCarregando(true);

        try {
            const response = await fetch('/api/produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome,
                    preco,
                    estoque,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.erro ?? 'Erro ao cadastrar produto.');
                return;
            }

            window.location.href = '/dashboard/produtos';
        } catch {
            setErro('Não foi possível cadastrar o produto.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="min-h-screen bg-zinc-100">
            <div className="mx-auto max-w-2xl p-6">
                <Link
                    href="/dashboard/produtos"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </Link>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Novo produto
                        </h1>

                        <p className="mt-1 text-zinc-500">
                            Cadastre um novo sabor de dindin
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="nome"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Nome
                            </label>

                            <input
                                id="nome"
                                value={nome}
                                onChange={(event) => setNome(event.target.value)}
                                placeholder="Ex: Ninho com Nutella"
                                required
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="preco"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Preço
                            </label>

                            <input
                                id="preco"
                                type="number"
                                step="0.01"
                                min="0"
                                value={preco}
                                onChange={(event) => setPreco(event.target.value)}
                                placeholder="7.00"
                                required
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="estoque"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Estoque inicial
                            </label>

                            <input
                                id="estoque"
                                type="number"
                                min="0"
                                value={estoque}
                                onChange={(event) => setEstoque(event.target.value)}
                                placeholder="20"
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
                            className="w-full rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {carregando ? 'Salvando...' : 'Cadastrar produto'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}