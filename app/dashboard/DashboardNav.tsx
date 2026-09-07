'use client';

import {
    BarChart3,
    Home,
    Package,
    ReceiptText,
    ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutButton } from './LogoutButton';

const links = [
    {
        href: '/dashboard',
        label: 'Início',
        icon: Home,
    },
    {
        href: '/dashboard/produtos',
        label: 'Produtos',
        icon: Package,
    },
    {
        href: '/dashboard/vendas',
        label: 'Vendas',
        icon: ShoppingCart,
    },
    {
        href: '/dashboard/gastos',
        label: 'Gastos',
        icon: ReceiptText,
    },
    {
        href: '/dashboard/relatorios',
        label: 'Relatórios',
        icon: BarChart3,
    },
];

export function DashboardNav() {
    const pathname = usePathname();

    function rotaAtiva(href: string) {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }

        return pathname.startsWith(href);
    }

    return (
        <header className="border-b border-zinc-200 bg-white">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex items-center justify-between py-4">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">
                            Dindin Controle 🍦
                        </h1>

                        <p className="text-sm text-zinc-500">
                            Controle da loja
                        </p>
                    </div>

                    <LogoutButton />
                </div>

                <nav className="flex gap-1 overflow-x-auto pb-3">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const ativo = rotaAtiva(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${ativo
                                        ? 'bg-pink-50 text-pink-600'
                                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                                    }`}
                            >
                                <Icon size={17} />

                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}