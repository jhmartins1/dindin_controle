import {
    BadgeDollarSign,
    CircleOff,
    PackageCheck,
    Plus,
    ShoppingCart,
    WalletCards,
} from 'lucide-react';

import Link from 'next/link';

import type { ReactNode } from 'react';

import { prisma } from '../../../src/lib/prisma';

import { CancelarVendaButton } from './CancelarVendaButton';

function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);
}

function formatarData(data: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'America/Sao_Paulo',
    }).format(data);
}

function formatarPagamento(forma: string) {
    switch (forma) {
        case 'PIX':
            return 'PIX';

        case 'DINHEIRO':
            return 'Dinheiro';

        case 'CARTAO':
            return 'Cartão';

        default:
            return forma;
    }
}

function estiloPagamento(forma: string) {
    switch (forma) {
        case 'PIX':
            return 'bg-emerald-50 text-emerald-700';

        case 'DINHEIRO':
            return 'bg-amber-50 text-amber-700';

        case 'CARTAO':
            return 'bg-sky-50 text-sky-700';

        default:
            return 'bg-zinc-100 text-zinc-600';
    }
}

export default async function VendasPage() {
    const vendas =
        await prisma.venda.findMany({
            include: {
                itens: {
                    include: {
                        produto: true,
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },

            take: 100,
        });

    const vendasValidas =
        vendas.filter(
            (venda) =>
                !venda.cancelada,
        );

    const vendasCanceladas =
        vendas.filter(
            (venda) =>
                venda.cancelada,
        );

    const totalVendido =
        vendasValidas.reduce(
            (total, venda) =>
                total +
                Number(venda.total),
            0,
        );

    const quantidadeVendida =
        vendasValidas.reduce(
            (total, venda) =>
                total +
                venda.itens.reduce(
                    (
                        subtotal,
                        item,
                    ) =>
                        subtotal +
                        item.quantidade,
                    0,
                ),
            0,
        );

    const ticketMedio =
        vendasValidas.length > 0
            ? totalVendido /
            vendasValidas.length
            : 0;

    return (
        <main className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-pink-600">
                            Comercial
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                            Vendas
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                            Consulte o histórico
                            e acompanhe as vendas
                            realizadas na loja.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/vendas/nova"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <Plus size={19} />

                        Registrar venda
                    </Link>
                </div>

                <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <CardResumo
                        titulo="Vendas válidas"
                        valor={`${vendasValidas.length}`}
                        descricao="Vendas concluídas"
                        icone={
                            <ShoppingCart
                                size={22}
                            />
                        }
                        destaque="rosa"
                    />

                    <CardResumo
                        titulo="Unidades vendidas"
                        valor={`${quantidadeVendida}`}
                        descricao="Produtos vendidos"
                        icone={
                            <PackageCheck
                                size={22}
                            />
                        }
                        destaque="azul"
                    />

                    <CardResumo
                        titulo="Faturamento"
                        valor={formatarMoeda(
                            totalVendido,
                        )}
                        descricao="Receita acumulada"
                        icone={
                            <BadgeDollarSign
                                size={22}
                            />
                        }
                        destaque="verde"
                    />

                    <CardResumo
                        titulo="Ticket médio"
                        valor={formatarMoeda(
                            ticketMedio,
                        )}
                        descricao={`${vendasCanceladas.length} canceladas`}
                        icone={
                            <WalletCards
                                size={22}
                            />
                        }
                        destaque="amarelo"
                    />
                </section>

                <section>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">
                                Histórico de vendas
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Últimas 100
                                vendas registradas
                            </p>
                        </div>

                        <span className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-bold text-zinc-600 shadow-sm">
                            {vendas.length}
                        </span>
                    </div>

                    {vendas.length === 0 ? (
                        <div className="rounded-3xl border border-zinc-200/70 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-300">
                                <ShoppingCart
                                    size={30}
                                />
                            </div>

                            <h2 className="mt-4 font-bold text-zinc-900">
                                Nenhuma venda
                                registrada
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                As vendas
                                realizadas aparecerão
                                aqui.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {vendas.map(
                                (venda) => {
                                    const quantidade =
                                        venda.itens.reduce(
                                            (
                                                total,
                                                item,
                                            ) =>
                                                total +
                                                item.quantidade,
                                            0,
                                        );

                                    return (
                                        <article
                                            key={
                                                venda.id
                                            }
                                            className={`relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition sm:p-6 ${venda.cancelada
                                                    ? 'border-red-100 opacity-70'
                                                    : 'border-zinc-200/70 hover:-translate-y-0.5 hover:shadow-md'
                                                }`}
                                        >
                                            <div
                                                className={`absolute inset-x-0 top-0 h-1 ${venda.cancelada
                                                        ? 'bg-red-400'
                                                        : 'bg-gradient-to-r from-pink-500 to-rose-400'
                                                    }`}
                                            />

                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h2 className="font-bold text-zinc-900">
                                                            Venda #
                                                            {
                                                                venda.id
                                                            }
                                                        </h2>

                                                        <span
                                                            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${estiloPagamento(
                                                                venda.formaPagamento,
                                                            )}`}
                                                        >
                                                            {formatarPagamento(
                                                                venda.formaPagamento,
                                                            )}
                                                        </span>

                                                        {venda.cancelada && (
                                                            <span className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                                                                <CircleOff
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                Cancelada
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-2 text-sm text-zinc-500">
                                                        {formatarData(
                                                            venda.createdAt,
                                                        )}
                                                    </p>

                                                    {venda.cancelada &&
                                                        venda.canceladaEm && (
                                                            <p className="mt-1 text-xs font-semibold text-red-500">
                                                                Cancelada
                                                                em{' '}
                                                                {formatarData(
                                                                    venda.canceladaEm,
                                                                )}
                                                            </p>
                                                        )}
                                                </div>

                                                <div className="sm:text-right">
                                                    <p
                                                        className={`text-2xl font-bold tracking-tight ${venda.cancelada
                                                                ? 'text-zinc-400 line-through'
                                                                : 'text-zinc-900'
                                                            }`}
                                                    >
                                                        {formatarMoeda(
                                                            Number(
                                                                venda.total,
                                                            ),
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-sm text-zinc-500">
                                                        {
                                                            quantidade
                                                        }{' '}
                                                        {quantidade ===
                                                            1
                                                            ? 'unidade'
                                                            : 'unidades'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="my-5 h-px bg-zinc-100" />

                                            <div className="space-y-3">
                                                {venda.itens.map(
                                                    (
                                                        item,
                                                    ) => (
                                                        <div
                                                            key={
                                                                item.id
                                                            }
                                                            className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50/70 px-3 py-2.5 text-sm"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-zinc-700">
                                                                    {
                                                                        item
                                                                            .produto
                                                                            .nome
                                                                    }
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-zinc-400">
                                                                    {
                                                                        item.quantidade
                                                                    }{' '}
                                                                    ×{' '}
                                                                    {formatarMoeda(
                                                                        Number(
                                                                            item.precoUnitario,
                                                                        ),
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <p className="shrink-0 font-bold text-zinc-900">
                                                                {formatarMoeda(
                                                                    Number(
                                                                        item.precoUnitario,
                                                                    ) *
                                                                    item.quantidade,
                                                                )}
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            {!venda.cancelada && (
                                                <div className="mt-5 flex justify-end border-t border-zinc-100 pt-4">
                                                    <CancelarVendaButton
                                                        vendaId={
                                                            venda.id
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </article>
                                    );
                                },
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

type Destaque =
    | 'rosa'
    | 'azul'
    | 'verde'
    | 'amarelo';

interface CardResumoProps {
    titulo: string;
    valor: string;
    descricao: string;
    icone: ReactNode;
    destaque: Destaque;
}

function CardResumo({
    titulo,
    valor,
    descricao,
    icone,
    destaque,
}: CardResumoProps) {
    const estilos = {
        rosa: {
            detalhe:
                'bg-pink-500',
            icone:
                'bg-pink-50 text-pink-600',
        },

        azul: {
            detalhe:
                'bg-sky-500',
            icone:
                'bg-sky-50 text-sky-600',
        },

        verde: {
            detalhe:
                'bg-emerald-500',
            icone:
                'bg-emerald-50 text-emerald-600',
        },

        amarelo: {
            detalhe:
                'bg-amber-400',
            icone:
                'bg-amber-50 text-amber-600',
        },
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <div
                className={`absolute inset-x-0 top-0 h-1 ${estilos[destaque].detalhe}`}
            />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-500">
                        {titulo}
                    </p>

                    <p className="mt-2 break-words text-2xl font-bold tracking-tight text-zinc-900">
                        {valor}
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                        {descricao}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${estilos[destaque].icone}`}
                >
                    {icone}
                </div>
            </div>
        </div>
    );
}