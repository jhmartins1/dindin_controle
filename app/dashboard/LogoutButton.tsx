'use client';

import {
    LoaderCircle,
    LogOut,
} from 'lucide-react';

import { useState } from 'react';

export function LogoutButton() {
    const [saindo, setSaindo] =
        useState(false);

    async function handleLogout() {
        try {
            setSaindo(true);

            await fetch('/api/logout', {
                method: 'POST',
            });

            window.location.href =
                '/login';
        } catch (error) {
            console.error(
                'Erro ao sair:',
                error,
            );
        } finally {
            setSaindo(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={saindo}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-zinc-600 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        >
            {saindo ? (
                <LoaderCircle
                    size={18}
                    className="animate-spin"
                />
            ) : (
                <LogOut size={18} />
            )}

            <span className="hidden sm:inline">
                {saindo
                    ? 'Saindo...'
                    : 'Sair'}
            </span>
        </button>
    );
}