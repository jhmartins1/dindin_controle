import {
    Plus,
    ShoppingCart,
} from 'lucide-react';

import Link from 'next/link';

import { prisma } from '../../../src/lib/prisma';

import { CancelarVendaButton } from './CancelarVendaButton';

function formatarMoeda(
    valor: number,
) {
    return new Intl.NumberFormat(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL',
        },
    ).format(valor);
}

function formatarData(
    data: Date,
) {
    return new Intl.DateTimeFormat(
        'pt-BR',
        {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone:
                'America/Sao_Paulo',
        },
    ).format(data);
}

function formatarPagamento(
    forma: string,
) {
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

    return (
        <main className="min-h-screen bg-zinc-100">
            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Vendas
                        </h1>

                        <p className="mt-1 text-zinc-500">
                            Histórico das vendas registradas
                        </p>
                    </div>

                    <Link
                        href="/dashboard/vendas/nova"
                        className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
                    >
                        <Plus size={19} />

                        Registrar venda
                    </Link>
                </div>

                <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <CardResumo
                        titulo="Vendas válidas"
                        valor={`${vendasValidas.length}`}
                    />

                    <CardResumo
                        titulo="Unidades vendidas"
                        valor={`${quantidadeVendida}`}
                    />

                    <CardResumo
                        titulo="Faturamento"
                        valor={formatarMoeda(
                            totalVendido,
                        )}
                    />

                    <CardResumo
                        titulo="Canceladas"
                        valor={`${vendasCanceladas.length}`}
                    />
                </section>

                {vendas.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <ShoppingCart
                            size={42}
                            className="mx-auto text-zinc-300"
                        />

                        <h2 className="mt-4 font-semibold text-zinc-900">
                            Nenhuma venda registrada
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            As vendas aparecerão aqui.
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
                                        className={`rounded-2xl border bg-white p-5 shadow-sm ${venda.cancelada
                                                ? 'border-red-100 opacity-70'
                                                : 'border-zinc-100'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="font-bold text-zinc-900">
                                                        Venda #
                                                        {
                                                            venda.id
                                                        }
                                                    </h2>

                                                    <span className="rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-600">
                                                        {formatarPagamento(
                                                            venda.formaPagamento,
                                                        )}
                                                    </span>

                                                    {venda.cancelada && (
                                                        <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
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
                                                        <p className="mt-1 text-xs font-medium text-red-500">
                                                            Cancelada em{' '}
                                                            {formatarData(
                                                                venda.canceladaEm,
                                                            )}
                                                        </p>
                                                    )}
                                            </div>

                                            <div className="sm:text-right">
                                                <p
                                                    className={`text-xl font-bold ${venda.cancelada
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

                                                <p className="text-sm text-zinc-500">
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

                                        <div className="mt-5 border-t border-zinc-100 pt-4">
                                            <div className="space-y-2">
                                                {venda.itens.map(
                                                    (
                                                        item,
                                                    ) => (
                                                        <div
                                                            key={
                                                                item.id
                                                            }
                                                            className="flex items-center justify-between gap-4 text-sm"
                                                        >
                                                            <span className="text-zinc-600">
                                                                {
                                                                    item
                                                                        .produto
                                                                        .nome
                                                                }{' '}
                                                                ×{' '}
                                                                {
                                                                    item.quantidade
                                                                }
                                                            </span>

                                                            <span className="font-medium text-zinc-900">
                                                                {formatarMoeda(
                                                                    Number(
                                                                        item.precoUnitario,
                                                                    ) *
                                                                    item.quantidade,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
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
            </div>
        </main>
    );
}

interface CardResumoProps {
    titulo: string;
    valor: string;
}

function CardResumo({
    titulo,
    valor,
}: CardResumoProps) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">
                {titulo}
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-900">
                {valor}
            </p>
        </div>
    );
}