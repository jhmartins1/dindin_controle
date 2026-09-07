'use client';

import {
    Ban,
    LoaderCircle,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

interface CancelarVendaButtonProps {
    vendaId: number;
}

export function CancelarVendaButton({
    vendaId,
}: CancelarVendaButtonProps) {
    const router =
        useRouter();

    const [
        cancelando,
        setCancelando,
    ] = useState(false);

    const [erro, setErro] =
        useState('');

    async function cancelarVenda() {
        const confirmou =
            window.confirm(
                `Deseja realmente cancelar a venda #${vendaId}?\n\nOs produtos serão devolvidos ao estoque.`,
            );

        if (!confirmou) {
            return;
        }

        try {
            setErro('');
            setCancelando(true);

            const response =
                await fetch(
                    `/api/vendas/${vendaId}/cancelar`,
                    {
                        method: 'POST',
                    },
                );

            const data =
                await response.json();

            if (!response.ok) {
                setErro(
                    data.erro ??
                    'Não foi possível cancelar a venda.',
                );

                return;
            }

            router.refresh();
        } catch {
            setErro(
                'Não foi possível cancelar a venda.',
            );
        } finally {
            setCancelando(false);
        }
    }

    return (
        <div className="flex flex-col items-end">
            <button
                type="button"
                onClick={
                    cancelarVenda
                }
                disabled={
                    cancelando
                }
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {cancelando ? (
                    <LoaderCircle
                        size={16}
                        className="animate-spin"
                    />
                ) : (
                    <Ban
                        size={16}
                    />
                )}

                {cancelando
                    ? 'Cancelando...'
                    : 'Cancelar venda'}
            </button>

            {erro && (
                <p className="mt-2 max-w-xs text-right text-xs font-medium text-red-600">
                    {erro}
                </p>
            )}
        </div>
    );
}