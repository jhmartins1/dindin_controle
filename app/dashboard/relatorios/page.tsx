import {
    BarChart3,
    DollarSign,
    Package,
    ReceiptText,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

import Link from 'next/link';

import { prisma } from '../../../src/lib/prisma';

interface RelatoriosPageProps {
    searchParams: Promise<{
        dias?: string;
    }>;
}

const PERIODOS = [
    {
        dias: 7,
        label: '7 dias',
    },
    {
        dias: 30,
        label: '30 dias',
    },
    {
        dias: 90,
        label: '90 dias',
    },
    {
        dias: 365,
        label: '1 ano',
    },
];

function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);
}

function formatarNumero(valor: number) {
    return new Intl.NumberFormat(
        'pt-BR',
    ).format(valor);
}

function calcularDataInicio(
    dias: number,
) {
    const data = new Date();

    data.setDate(
        data.getDate() - (dias - 1),
    );

    data.setHours(0, 0, 0, 0);

    return data;
}

export default async function RelatoriosPage({
    searchParams,
}: RelatoriosPageProps) {
    const params =
        await searchParams;

    const diasRecebidos =
        Number(params.dias);

    const diasPermitidos =
        PERIODOS.map(
            (periodo) =>
                periodo.dias,
        );

    const dias =
        diasPermitidos.includes(
            diasRecebidos,
        )
            ? diasRecebidos
            : 30;

    const inicio =
        calcularDataInicio(dias);

    const [vendas, gastos] =
        await Promise.all([
            prisma.venda.findMany({
                where: {
                    cancelada: false,

                    createdAt: {
                        gte: inicio,
                    },
                },

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
            }),

            prisma.gasto.findMany({
                where: {
                    createdAt: {
                        gte: inicio,
                    },
                },

                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);

    const faturamento =
        vendas.reduce(
            (total, venda) =>
                total +
                Number(venda.total),
            0,
        );

    const totalGastos =
        gastos.reduce(
            (total, gasto) =>
                total +
                Number(gasto.valor),
            0,
        );

    const resultado =
        faturamento -
        totalGastos;

    const quantidadeVendas =
        vendas.length;

    const unidadesVendidas =
        vendas.reduce(
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
        quantidadeVendas > 0
            ? faturamento /
            quantidadeVendas
            : 0;

    const produtosMap =
        new Map<
            number,
            {
                nome: string;
                quantidade: number;
                faturamento: number;
            }
        >();

    for (const venda of vendas) {
        for (const item of venda.itens) {
            const atual =
                produtosMap.get(
                    item.produtoId,
                );

            const faturamentoItem =
                Number(
                    item.precoUnitario,
                ) *
                item.quantidade;

            if (atual) {
                atual.quantidade +=
                    item.quantidade;

                atual.faturamento +=
                    faturamentoItem;
            } else {
                produtosMap.set(
                    item.produtoId,
                    {
                        nome:
                            item.produto
                                .nome,

                        quantidade:
                            item.quantidade,

                        faturamento:
                            faturamentoItem,
                    },
                );
            }
        }
    }

    const produtosMaisVendidos =
        Array.from(
            produtosMap.values(),
        ).sort(
            (a, b) =>
                b.quantidade -
                a.quantidade,
        );

    const produtosMaiorFaturamento =
        Array.from(
            produtosMap.values(),
        ).sort(
            (a, b) =>
                b.faturamento -
                a.faturamento,
        );

    return (
        <main className="min-h-screen bg-zinc-100">
            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-pink-50 p-3 text-pink-600">
                            <BarChart3
                                size={24}
                            />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900">
                                Relatórios
                            </h1>

                            <p className="mt-1 text-zinc-500">
                                Resumo financeiro
                                e desempenho das
                                vendas
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-8 flex flex-wrap gap-2">
                    {PERIODOS.map(
                        (periodo) => (
                            <Link
                                key={
                                    periodo.dias
                                }
                                href={`/dashboard/relatorios?dias=${periodo.dias}`}
                                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${dias ===
                                        periodo.dias
                                        ? 'bg-pink-600 text-white'
                                        : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                                    }`}
                            >
                                {
                                    periodo.label
                                }
                            </Link>
                        ),
                    )}
                </div>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <CardResumo
                        titulo="Faturamento"
                        valor={formatarMoeda(
                            faturamento,
                        )}
                        icone={
                            <DollarSign
                                size={22}
                            />
                        }
                    />

                    <CardResumo
                        titulo="Gastos"
                        valor={formatarMoeda(
                            totalGastos,
                        )}
                        icone={
                            <TrendingDown
                                size={22}
                            />
                        }
                    />

                    <CardResumo
                        titulo="Resultado"
                        valor={formatarMoeda(
                            resultado,
                        )}
                        icone={
                            resultado >=
                                0 ? (
                                <TrendingUp
                                    size={22}
                                />
                            ) : (
                                <TrendingDown
                                    size={22}
                                />
                            )
                        }
                    />

                    <CardResumo
                        titulo="Vendas"
                        valor={formatarNumero(
                            quantidadeVendas,
                        )}
                        icone={
                            <ShoppingCart
                                size={22}
                            />
                        }
                    />

                    <CardResumo
                        titulo="Ticket médio"
                        valor={formatarMoeda(
                            ticketMedio,
                        )}
                        icone={
                            <ReceiptText
                                size={22}
                            />
                        }
                    />
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-zinc-500">
                            Unidades vendidas
                        </p>

                        <div className="mt-2 flex items-center gap-3">
                            <Package
                                size={25}
                                className="text-pink-600"
                            />

                            <p className="text-3xl font-bold text-zinc-900">
                                {formatarNumero(
                                    unidadesVendidas,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-zinc-500">
                            Período analisado
                        </p>

                        <p className="mt-2 text-3xl font-bold text-zinc-900">
                            {dias}
                        </p>

                        <p className="text-sm text-zinc-500">
                            dias
                        </p>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h2 className="font-bold text-zinc-900">
                                Produtos mais vendidos
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Ranking por
                                quantidade de
                                unidades
                            </p>
                        </div>

                        {produtosMaisVendidos.length ===
                            0 ? (
                            <EstadoVazio />
                        ) : (
                            <div className="space-y-3">
                                {produtosMaisVendidos
                                    .slice(
                                        0,
                                        10,
                                    )
                                    .map(
                                        (
                                            produto,
                                            index,
                                        ) => (
                                            <div
                                                key={
                                                    produto.nome
                                                }
                                                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-sm font-bold text-pink-600">
                                                        {index +
                                                            1}
                                                    </div>

                                                    <div>
                                                        <p className="font-medium text-zinc-900">
                                                            {
                                                                produto.nome
                                                            }
                                                        </p>

                                                        <p className="text-sm text-zinc-500">
                                                            {formatarMoeda(
                                                                produto.faturamento,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-bold text-zinc-900">
                                                        {
                                                            produto.quantidade
                                                        }
                                                    </p>

                                                    <p className="text-xs text-zinc-500">
                                                        unidades
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h2 className="font-bold text-zinc-900">
                                Maior faturamento
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Produtos que mais
                                geraram receita
                            </p>
                        </div>

                        {produtosMaiorFaturamento.length ===
                            0 ? (
                            <EstadoVazio />
                        ) : (
                            <div className="space-y-3">
                                {produtosMaiorFaturamento
                                    .slice(
                                        0,
                                        10,
                                    )
                                    .map(
                                        (
                                            produto,
                                            index,
                                        ) => (
                                            <div
                                                key={
                                                    produto.nome
                                                }
                                                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-sm font-bold text-pink-600">
                                                        {index +
                                                            1}
                                                    </div>

                                                    <div>
                                                        <p className="font-medium text-zinc-900">
                                                            {
                                                                produto.nome
                                                            }
                                                        </p>

                                                        <p className="text-sm text-zinc-500">
                                                            {
                                                                produto.quantidade
                                                            }{' '}
                                                            unidades
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="font-bold text-zinc-900">
                                                    {formatarMoeda(
                                                        produto.faturamento,
                                                    )}
                                                </p>
                                            </div>
                                        ),
                                    )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

interface CardResumoProps {
    titulo: string;
    valor: string;
    icone: React.ReactNode;
}

function CardResumo({
    titulo,
    valor,
    icone,
}: CardResumoProps) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-zinc-500">
                        {titulo}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-zinc-900">
                        {valor}
                    </p>
                </div>

                <div className="rounded-xl bg-pink-50 p-3 text-pink-600">
                    {icone}
                </div>
            </div>
        </div>
    );
}

function EstadoVazio() {
    return (
        <div className="rounded-xl bg-zinc-50 p-8 text-center">
            <Package
                size={36}
                className="mx-auto text-zinc-300"
            />

            <p className="mt-3 font-medium text-zinc-700">
                Nenhuma venda no período
            </p>

            <p className="mt-1 text-sm text-zinc-500">
                Registre vendas para gerar
                os relatórios.
            </p>
        </div>
    );
}