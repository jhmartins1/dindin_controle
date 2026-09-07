'use client';

import { PackagePlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

interface AdicionarEstoqueProps {
    produtoId: number;
    produtoNome: string;
    estoqueAtual: number;
}

export function AdicionarEstoque({
    produtoId,
    produtoNome,
    estoqueAtual,
}: AdicionarEstoqueProps) {
    const router = useRouter();

    const [aberto, setAberto] = useState(false);
    const [quantidade, setQuantidade] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    function fecharModal() {
        if (salvando) {
            return;
        }

        setAberto(false);
        setQuantidade('');
        setErro('');
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setErro('');

        const quantidadeNumero = Number(quantidade);

        if (
            !Number.isInteger(quantidadeNumero) ||
            quantidadeNumero <= 0
        ) {
            setErro('Informe uma quantidade válida.');
            return;
        }

        try {
            setSalvando(true);

            const response = await fetch(
                `/api/produtos/${produtoId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        quantidade: quantidadeNumero,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setErro(
                    data.erro ?? 'Não foi possível atualizar o estoque.',
                );
                return;
            }

            setAberto(false);
            setQuantidade('');
            setErro('');

            router.refresh();
        } catch {
            setErro('Não foi possível atualizar o estoque.');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setAberto(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200 px-4 py-2.5 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
            >
                <PackagePlus size={17} />
                Adicionar estoque
            </button>

            {aberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900">
                                    Adicionar estoque
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    {produtoNome}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fecharModal}
                                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-5 rounded-xl bg-zinc-50 p-4">
                            <p className="text-sm text-zinc-500">
                                Estoque atual
                            </p>

                            <p className="mt-1 text-2xl font-bold text-zinc-900">
                                {estoqueAtual}
                                <span className="ml-1 text-sm font-normal text-zinc-500">
                                    unidades
                                </span>
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-5 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor={`quantidade-${produtoId}`}
                                    className="mb-2 block text-sm font-medium text-zinc-700"
                                >
                                    Quantidade produzida
                                </label>

                                <input
                                    id={`quantidade-${produtoId}`}
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={quantidade}
                                    onChange={(event) =>
                                        setQuantidade(event.target.value)
                                    }
                                    placeholder="Ex: 20"
                                    autoFocus
                                    required
                                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                                />
                            </div>

                            {quantidade &&
                                Number(quantidade) > 0 && (
                                    <div className="rounded-xl bg-pink-50 p-4">
                                        <p className="text-sm text-pink-700">
                                            Novo estoque
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-pink-700">
                                            {estoqueAtual +
                                                Number(quantidade)}{' '}
                                            unidades
                                        </p>
                                    </div>
                                )}

                            {erro && (
                                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {erro}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    disabled={salvando}
                                    className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <PackagePlus size={18} />

                                    {salvando
                                        ? 'Adicionando...'
                                        : 'Adicionar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}