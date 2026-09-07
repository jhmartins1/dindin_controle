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
    const router = useRouter();

    const [cancelando, setCancelando] =
        useState(false);

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

            const response = await fetch(
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
        <div>
            <button
                type="button"
                onClick={cancelarVenda}
                disabled={cancelando}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {cancelando ? (
                    <LoaderCircle
                        size={16}
                        className="animate-spin"
                    />
                ) : (
                    <Ban size={16} />
                )}

                {cancelando
                    ? 'Cancelando...'
                    : 'Cancelar venda'}
            </button>

            {erro && (
                <p className="mt-2 text-sm text-red-600">
                    {erro}
                </p>
            )}
        </div>
    );
}