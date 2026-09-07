'use client';

import { LogOut } from 'lucide-react';
import { useState } from 'react';

export function LogoutButton() {
    const [saindo, setSaindo] = useState(false);

    async function handleLogout() {
        try {
            setSaindo(true);

            await fetch('/api/logout', {
                method: 'POST',
            });

            window.location.href = '/login';
        } catch (error) {
            console.error('Erro ao sair:', error);
        } finally {
            setSaindo(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={saindo}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
        >
            <LogOut size={18} />

            {saindo ? 'Saindo...' : 'Sair'}
        </button>
    );
}