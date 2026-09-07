'use client';

import {
    BarChart3,
    Home,
    IceCreamBowl,
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
        <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/90 shadow-sm shadow-zinc-900/[0.02] backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex min-h-20 items-center justify-between gap-4">
                    <Link
                        href="/dashboard"
                        className="group flex min-w-0 items-center gap-3"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20 transition group-hover:scale-105">
                            <IceCreamBowl
                                size={23}
                                strokeWidth={2.2}
                            />
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate text-lg font-bold tracking-tight text-zinc-900">
                                    Dindin Controle
                                </h1>
                            </div>

                            <p className="text-xs font-medium text-zinc-400">
                                Gestão da loja
                            </p>
                        </div>
                    </Link>

                    <LogoutButton />
                </div>

                <nav className="-mx-1 flex gap-1 overflow-x-auto pb-3 scrollbar-none">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const ativo =
                            rotaAtiva(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${ativo
                                        ? 'bg-pink-50 text-pink-600'
                                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                                    }`}
                            >
                                <Icon
                                    size={17}
                                    strokeWidth={
                                        ativo
                                            ? 2.5
                                            : 2
                                    }
                                />

                                {link.label}

                                {ativo && (
                                    <span className="absolute inset-x-4 -bottom-3 h-0.5 rounded-full bg-pink-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}