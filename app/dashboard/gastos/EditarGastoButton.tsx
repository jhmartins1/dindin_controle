'use client';

import {
    LoaderCircle,
    Pencil,
    Trash2,
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

interface EditarGastoButtonProps {
    gasto: {
        id: number;
        descricao: string;
        valor: number;
        categoria: Categoria;
    };
}

export function EditarGastoButton({
    gasto,
}: EditarGastoButtonProps) {
    const router = useRouter();

    const [aberto, setAberto] =
        useState(false);

    const [descricao, setDescricao] =
        useState(gasto.descricao);

    const [valor, setValor] =
        useState(
            String(gasto.valor),
        );

    const [categoria, setCategoria] =
        useState<Categoria>(
            gasto.categoria,
        );

    const [salvando, setSalvando] =
        useState(false);

    const [excluindo, setExcluindo] =
        useState(false);

    const [erro, setErro] =
        useState('');

    function abrirModal() {
        setDescricao(
            gasto.descricao,
        );

        setValor(
            String(gasto.valor),
        );

        setCategoria(
            gasto.categoria,
        );

        setErro('');
        setAberto(true);
    }

    function fecharModal() {
        if (
            salvando ||
            excluindo
        ) {
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
                `/api/gastos/${gasto.id}`,
                {
                    method: 'PUT',
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
                    'Não foi possível atualizar o gasto.',
                );

                return;
            }

            setAberto(false);

            router.refresh();
        } catch {
            setErro(
                'Não foi possível atualizar o gasto.',
            );
        } finally {
            setSalvando(false);
        }
    }

    async function excluirGasto() {
        const confirmou =
            window.confirm(
                `Deseja realmente excluir o gasto "${gasto.descricao}"?\n\nEssa ação não poderá ser desfeita.`,
            );

        if (!confirmou) {
            return;
        }

        try {
            setErro('');
            setExcluindo(true);

            const response = await fetch(
                `/api/gastos/${gasto.id}`,
                {
                    method: 'DELETE',
                },
            );

            const data =
                await response.json();

            if (!response.ok) {
                setErro(
                    data.erro ??
                    'Não foi possível excluir o gasto.',
                );

                return;
            }

            setAberto(false);

            router.refresh();
        } catch {
            setErro(
                'Não foi possível excluir o gasto.',
            );
        } finally {
            setExcluindo(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={abrirModal}
                title="Editar gasto"
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
                <Pencil size={18} />
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
                                    Editar gasto
                                </h2>

                                <p className="mt-1 text-sm text-zinc-600">
                                    Atualize os dados da despesa
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    fecharModal
                                }
                                disabled={
                                    salvando ||
                                    excluindo
                                }
                                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
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
                                <label className="mb-2 block text-sm font-medium text-zinc-900">
                                    Descrição
                                </label>

                                <input
                                    value={
                                        descricao
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setDescricao(
                                            event.target
                                                .value,
                                        )
                                    }
                                    required
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-900">
                                    Valor
                                </label>

                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={valor}
                                    onChange={(
                                        event,
                                    ) =>
                                        setValor(
                                            event.target
                                                .value,
                                        )
                                    }
                                    required
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-900">
                                    Categoria
                                </label>

                                <select
                                    value={
                                        categoria
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setCategoria(
                                            event.target
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

                            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={
                                        excluirGasto
                                    }
                                    disabled={
                                        salvando ||
                                        excluindo
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {excluindo ? (
                                        <LoaderCircle
                                            size={
                                                18
                                            }
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Trash2
                                            size={
                                                18
                                            }
                                        />
                                    )}

                                    {excluindo
                                        ? 'Excluindo...'
                                        : 'Excluir'}
                                </button>

                                <div className="flex flex-1 gap-3">
                                    <button
                                        type="button"
                                        onClick={
                                            fecharModal
                                        }
                                        disabled={
                                            salvando ||
                                            excluindo
                                        }
                                        className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            salvando ||
                                            excluindo
                                        }
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {salvando && (
                                            <LoaderCircle
                                                size={
                                                    18
                                                }
                                                className="animate-spin"
                                            />
                                        )}

                                        {salvando
                                            ? 'Salvando...'
                                            : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}