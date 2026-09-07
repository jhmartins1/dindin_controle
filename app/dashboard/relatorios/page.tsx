import {
    BarChart3,
    CalendarDays,
    DollarSign,
    Package,
    ReceiptText,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

import Link from 'next/link';

import type {
    ReactNode,
} from 'react';

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

function formatarNumero(
    valor: number,
) {
    return new Intl.NumberFormat(
        'pt-BR',
    ).format(valor);
}

function calcularDataInicio(
    dias: number,
) {
    const agora =
        new Date();

    const dataBrasilia =
        new Intl.DateTimeFormat(
            'en-CA',
            {
                timeZone:
                    'America/Sao_Paulo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            },
        ).format(agora);

    const hoje =
        new Date(
            `${dataBrasilia}T00:00:00-03:00`,
        );

    hoje.setDate(
        hoje.getDate() -
        (dias - 1),
    );

    return hoje;
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
                    cancelada:
                        false,

                    createdAt: {
                        gte: inicio,
                    },
                },

                include: {
                    itens: {
                        include: {
                            produto:
                                true,
                        },
                    },
                },
            }),

            prisma.gasto.findMany({
                where: {
                    createdAt: {
                        gte: inicio,
                    },
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

    const margem =
        faturamento > 0
            ? (resultado /
                faturamento) *
            100
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
                            item
                                .produto
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

    const maiorQuantidade =
        produtosMaisVendidos[0]
            ?.quantidade ?? 1;

    const maiorFaturamento =
        produtosMaiorFaturamento[0]
            ?.faturamento ?? 1;

    return (
        <main className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
                <div className="mb-7">
                    <p className="mb-1 text-sm font-semibold text-pink-600">
                        Análises
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                        Relatórios
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                        Analise o desempenho
                        financeiro e descubra
                        quais produtos mais
                        contribuem para as
                        vendas.
                    </p>
                </div>

                <div className="mb-7 flex flex-wrap gap-2">
                    {PERIODOS.map(
                        (periodo) => (
                            <Link
                                key={
                                    periodo.dias
                                }
                                href={`/dashboard/relatorios?dias=${periodo.dias}`}
                                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${dias ===
                                    periodo.dias
                                    ? 'bg-linear-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/15'
                                    : 'border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50'
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
                        descricao="Receita no período"
                        icone={
                            <DollarSign
                                size={22}
                            />
                        }
                        destaque="verde"
                    />

                    <CardResumo
                        titulo="Gastos"
                        valor={formatarMoeda(
                            totalGastos,
                        )}
                        descricao="Despesas no período"
                        icone={
                            <TrendingDown
                                size={22}
                            />
                        }
                        destaque="vermelho"
                    />

                    <CardResumo
                        titulo="Resultado"
                        valor={formatarMoeda(
                            resultado,
                        )}
                        descricao={
                            resultado >=
                                0
                                ? 'Saldo positivo'
                                : 'Saldo negativo'
                        }
                        icone={
                            resultado >=
                                0 ? (
                                <TrendingUp
                                    size={
                                        22
                                    }
                                />
                            ) : (
                                <TrendingDown
                                    size={
                                        22
                                    }
                                />
                            )
                        }
                        destaque={
                            resultado >=
                                0
                                ? 'verde'
                                : 'vermelho'
                        }
                    />

                    <CardResumo
                        titulo="Vendas"
                        valor={formatarNumero(
                            quantidadeVendas,
                        )}
                        descricao="Vendas concluídas"
                        icone={
                            <ShoppingCart
                                size={22}
                            />
                        }
                        destaque="rosa"
                    />

                    <CardResumo
                        titulo="Ticket médio"
                        valor={formatarMoeda(
                            ticketMedio,
                        )}
                        descricao="Média por venda"
                        icone={
                            <ReceiptText
                                size={22}
                            />
                        }
                        destaque="azul"
                    />
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-3">
                    <InfoCard
                        titulo="Unidades vendidas"
                        valor={formatarNumero(
                            unidadesVendidas,
                        )}
                        icone={
                            <Package
                                size={21}
                            />
                        }
                    />

                    <InfoCard
                        titulo="Período analisado"
                        valor={`${dias} dias`}
                        icone={
                            <CalendarDays
                                size={21}
                            />
                        }
                    />

                    <InfoCard
                        titulo="Margem do período"
                        valor={`${margem.toFixed(
                            1,
                        )}%`}
                        icone={
                            <BarChart3
                                size={21}
                            />
                        }
                    />
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                    <RankingCard
                        titulo="Produtos mais vendidos"
                        descricao="Ranking por quantidade de unidades"
                    >
                        {produtosMaisVendidos.length ===
                            0 ? (
                            <EstadoVazio />
                        ) : (
                            <div className="mt-5 space-y-4">
                                {produtosMaisVendidos
                                    .slice(
                                        0,
                                        10,
                                    )
                                    .map(
                                        (
                                            produto,
                                            index,
                                        ) => {
                                            const percentual =
                                                (produto.quantidade /
                                                    maiorQuantidade) *
                                                100;

                                            return (
                                                <div
                                                    key={
                                                        produto.nome
                                                    }
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-sm font-bold text-pink-600">
                                                                {index +
                                                                    1}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-zinc-900">
                                                                    {
                                                                        produto.nome
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-zinc-400">
                                                                    {formatarMoeda(
                                                                        produto.faturamento,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <p className="shrink-0 font-bold text-zinc-900">
                                                            {
                                                                produto.quantidade
                                                            }

                                                            <span className="ml-1 text-xs font-medium text-zinc-400">
                                                                un.
                                                            </span>
                                                        </p>
                                                    </div>

                                                    <div className="ml-12 mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                                                        <div
                                                            className="h-full rounded-full bg-linear-to-r from-pink-600 to-rose-400"
                                                            style={{
                                                                width: `${percentual}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                            </div>
                        )}
                    </RankingCard>

                    <RankingCard
                        titulo="Maior faturamento"
                        descricao="Produtos que mais geraram receita"
                    >
                        {produtosMaiorFaturamento.length ===
                            0 ? (
                            <EstadoVazio />
                        ) : (
                            <div className="mt-5 space-y-4">
                                {produtosMaiorFaturamento
                                    .slice(
                                        0,
                                        10,
                                    )
                                    .map(
                                        (
                                            produto,
                                            index,
                                        ) => {
                                            const percentual =
                                                (produto.faturamento /
                                                    maiorFaturamento) *
                                                100;

                                            return (
                                                <div
                                                    key={
                                                        produto.nome
                                                    }
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-600">
                                                                {index +
                                                                    1}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-zinc-900">
                                                                    {
                                                                        produto.nome
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-zinc-400">
                                                                    {
                                                                        produto.quantidade
                                                                    }{' '}
                                                                    unidades
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <p className="shrink-0 font-bold text-zinc-900">
                                                            {formatarMoeda(
                                                                produto.faturamento,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="ml-12 mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                                                        <div
                                                            className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-400"
                                                            style={{
                                                                width: `${percentual}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                            </div>
                        )}
                    </RankingCard>
                </section>
            </div>
        </main>
    );
}

type Destaque =
    | 'verde'
    | 'vermelho'
    | 'rosa'
    | 'azul';

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
        verde: {
            detalhe:
                'bg-emerald-500',
            icone:
                'bg-emerald-50 text-emerald-600',
        },

        vermelho: {
            detalhe:
                'bg-red-500',
            icone:
                'bg-red-50 text-red-500',
        },

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

                    <p className="mt-2 wrap-break-word text-2xl font-bold tracking-tight text-zinc-900">
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

interface InfoCardProps {
    titulo: string;
    valor: string;
    icone: ReactNode;
}

function InfoCard({
    titulo,
    valor,
    icone,
}: InfoCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                {icone}
            </div>

            <div>
                <p className="text-xs font-medium text-zinc-400">
                    {titulo}
                </p>

                <p className="mt-1 text-xl font-bold text-zinc-900">
                    {valor}
                </p>
            </div>
        </div>
    );
}

interface RankingCardProps {
    titulo: string;
    descricao: string;
    children: ReactNode;
}

function RankingCard({
    titulo,
    descricao,
    children,
}: RankingCardProps) {
    return (
        <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-zinc-900">
                {titulo}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
                {descricao}
            </p>

            {children}
        </div>
    );
}

function EstadoVazio() {
    return (
        <div className="mt-5 rounded-2xl bg-zinc-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-zinc-300 shadow-sm">
                <Package size={28} />
            </div>

            <p className="mt-4 font-semibold text-zinc-700">
                Nenhuma venda no período
            </p>

            <p className="mt-1 text-sm text-zinc-500">
                Registre vendas para gerar
                dados neste relatório.
            </p>
        </div>
    );
}