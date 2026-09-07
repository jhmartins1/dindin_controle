'use client';

import {
    Plus,
    X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    FormEvent,
    useState,
} from 'react';

type Categoria =
    | 'INGREDIENTES'
    | 'EMBALAGENS'
    | 'TRANSPORTE'
    | 'OUTROS';

export function GastoForm() {
    const router = useRouter();

    const [aberto, setAberto] =
        useState(false);

    const [descricao, setDescricao] =
        useState('');

    const [valor, setValor] =
        useState('');

    const [categoria, setCategoria] =
        useState<Categoria>('INGREDIENTES');

    const [salvando, setSalvando] =
        useState(false);

    const [erro, setErro] =
        useState('');

    function abrirModal() {
        setErro('');
        setAberto(true);
    }

    function fecharModal() {
        if (salvando) {
            return;
        }

        setAberto(false);
        setErro('');
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setErro('');

        const descricaoFormatada =
            descricao.trim();

        const valorNumero =
            Number(
                valor.replace(',', '.'),
            );

        if (!descricaoFormatada) {
            setErro(
                'Informe a descrição do gasto.',
            );
            return;
        }

        if (
            !Number.isFinite(valorNumero) ||
            valorNumero <= 0
        ) {
            setErro(
                'Informe um valor válido.',
            );
            return;
        }

        try {
            setSalvando(true);

            const response = await fetch(
                '/api/gastos',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify({
                        descricao:
                            descricaoFormatada,
                        valor: valorNumero,
                        categoria,
                    }),
                },
            );

            const data =
                await response.json();

            if (!response.ok) {
                setErro(
                    data.erro ??
                    'Não foi possível registrar o gasto.',
                );

                return;
            }

            setDescricao('');
            setValor('');
            setCategoria('INGREDIENTES');
            setErro('');
            setAberto(false);

            router.refresh();
        } catch {
            setErro(
                'Não foi possível registrar o gasto.',
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={abrirModal}
                className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
            >
                <Plus size={19} />

                Novo gasto
            </button>

            {aberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onMouseDown={(
                        event,
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            fecharModal();
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-950">
                                    Registrar gasto
                                </h2>

                                <p className="mt-1 text-sm text-zinc-600">
                                    Informe os dados da
                                    despesa
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    fecharModal
                                }
                                disabled={
                                    salvando
                                }
                                aria-label="Fechar"
                                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="mt-6 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="descricao-gasto"
                                    className="mb-2 block text-sm font-medium text-zinc-900"
                                >
                                    Descrição
                                </label>

                                <input
                                    id="descricao-gasto"
                                    type="text"
                                    value={
                                        descricao
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setDescricao(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Ex: morango"
                                    autoComplete="off"
                                    required
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="valor-gasto"
                                    className="mb-2 block text-sm font-medium text-zinc-900"
                                >
                                    Valor
                                </label>

                                <input
                                    id="valor-gasto"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={valor}
                                    onChange={(
                                        event,
                                    ) =>
                                        setValor(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="10,50"
                                    required
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="categoria-gasto"
                                    className="mb-2 block text-sm font-medium text-zinc-900"
                                >
                                    Categoria
                                </label>

                                <select
                                    id="categoria-gasto"
                                    value={
                                        categoria
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setCategoria(
                                            event
                                                .target
                                                .value as Categoria,
                                        )
                                    }
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                                >
                                    <option value="INGREDIENTES">
                                        Ingredientes
                                    </option>

                                    <option value="EMBALAGENS">
                                        Embalagens
                                    </option>

                                    <option value="TRANSPORTE">
                                        Transporte
                                    </option>

                                    <option value="OUTROS">
                                        Outros
                                    </option>
                                </select>
                            </div>

                            {erro && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    {erro}
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={
                                        fecharModal
                                    }
                                    disabled={
                                        salvando
                                    }
                                    className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        salvando
                                    }
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus
                                        size={18}
                                    />

                                    {salvando
                                        ? 'Registrando...'
                                        : 'Registrar gasto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}