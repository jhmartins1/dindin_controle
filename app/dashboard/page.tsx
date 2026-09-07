import {
    AlertTriangle,
    ArrowRight,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    WalletCards,
} from 'lucide-react';

import Link from 'next/link';

import type {
    ReactNode,
} from 'react';

import { prisma } from '../../src/lib/prisma';

const TIME_ZONE =
    'America/Sao_Paulo';

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
            timeZone: TIME_ZONE,
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

function chaveDataBrasilia(
    data: Date,
) {
    return new Intl.DateTimeFormat(
        'en-CA',
        {
            timeZone: TIME_ZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        },
    ).format(data);
}

function criarUltimosDias(
    quantidade: number,
) {
    const hoje =
        chaveDataBrasilia(
            new Date(),
        );

    const dataBase =
        new Date(
            `${hoje}T12:00:00Z`,
        );

    const dias: {
        chave: string;
        label: string;
    }[] = [];

    for (
        let indice =
            quantidade - 1;
        indice >= 0;
        indice--
    ) {
        const data =
            new Date(dataBase);

        data.setUTCDate(
            data.getUTCDate() -
            indice,
        );

        const chave =
            data
                .toISOString()
                .slice(0, 10);

        const label =
            new Intl.DateTimeFormat(
                'pt-BR',
                {
                    weekday: 'short',
                    timeZone:
                        'America/Sao_Paulo',
                },
            )
                .format(
                    new Date(
                        `${chave}T12:00:00-03:00`,
                    ),
                )
                .replace('.', '');

        dias.push({
            chave,
            label,
        });
    }

    return dias;
}

export default async function DashboardPage() {
    const dias =
        criarUltimosDias(7);

    const chaveHoje =
        dias[dias.length - 1].chave;

    const inicioPeriodo =
        new Date(
            `${dias[0].chave}T00:00:00-03:00`,
        );

    const fimPeriodo =
        new Date(
            `${chaveHoje}T23:59:59.999-03:00`,
        );

    const [
        vendasPeriodo,
        gastosPeriodo,
        produtos,
    ] = await Promise.all([
        prisma.venda.findMany({
            where: {
                cancelada: false,

                createdAt: {
                    gte:
                        inicioPeriodo,
                    lte:
                        fimPeriodo,
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

            orderBy: {
                createdAt:
                    'desc',
            },
        }),

        prisma.gasto.findMany({
            where: {
                createdAt: {
                    gte:
                        inicioPeriodo,
                    lte:
                        fimPeriodo,
                },
            },

            orderBy: {
                createdAt:
                    'desc',
            },
        }),

        prisma.produto.findMany({
            where: {
                ativo: true,
            },

            orderBy: {
                nome: 'asc',
            },
        }),
    ]);

    const vendasHoje =
        vendasPeriodo.filter(
            (venda) =>
                chaveDataBrasilia(
                    venda.createdAt,
                ) === chaveHoje,
        );

    const gastosHoje =
        gastosPeriodo.filter(
            (gasto) =>
                chaveDataBrasilia(
                    gasto.createdAt,
                ) === chaveHoje,
        );

    const faturamentoHoje =
        vendasHoje.reduce(
            (total, venda) =>
                total +
                Number(venda.total),
            0,
        );

    const totalGastosHoje =
        gastosHoje.reduce(
            (total, gasto) =>
                total +
                Number(gasto.valor),
            0,
        );

    const resultadoHoje =
        faturamentoHoje -
        totalGastosHoje;

    const quantidadeVendidaHoje =
        vendasHoje.reduce(
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

    const estoqueTotal =
        produtos.reduce(
            (total, produto) =>
                total +
                produto.estoque,
            0,
        );

    const produtosEstoqueBaixo =
        produtos.filter(
            (produto) =>
                produto.estoque <= 5,
        );

    const ultimasVendas =
        vendasHoje.slice(0, 5);

    const grafico =
        dias.map((dia) => {
            const faturamento =
                vendasPeriodo
                    .filter(
                        (venda) =>
                            chaveDataBrasilia(
                                venda.createdAt,
                            ) ===
                            dia.chave,
                    )
                    .reduce(
                        (
                            total,
                            venda,
                        ) =>
                            total +
                            Number(
                                venda.total,
                            ),
                        0,
                    );

            const gastos =
                gastosPeriodo
                    .filter(
                        (gasto) =>
                            chaveDataBrasilia(
                                gasto.createdAt,
                            ) ===
                            dia.chave,
                    )
                    .reduce(
                        (
                            total,
                            gasto,
                        ) =>
                            total +
                            Number(
                                gasto.valor,
                            ),
                        0,
                    );

            return {
                ...dia,
                faturamento,
                gastos,
            };
        });

    const maiorValorGrafico =
        Math.max(
            ...grafico.flatMap(
                (dia) => [
                    dia.faturamento,
                    dia.gastos,
                ],
            ),
            1,
        );

    const faturamento7Dias =
        vendasPeriodo.reduce(
            (total, venda) =>
                total +
                Number(venda.total),
            0,
        );

    const gastos7Dias =
        gastosPeriodo.reduce(
            (total, gasto) =>
                total +
                Number(gasto.valor),
            0,
        );

    return (
        <main className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-pink-600">
                            Visão geral
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                            Dashboard
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                            Acompanhe vendas,
                            despesas, estoque e o
                            desempenho da loja.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/vendas/nova"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-pink-600 to-rose-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <ShoppingCart
                            size={19}
                        />

                        Registrar venda
                    </Link>
                </div>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <CardResumo
                        titulo="Faturamento hoje"
                        valor={formatarMoeda(
                            faturamentoHoje,
                        )}
                        descricao="Vendas concluídas"
                        icone={
                            <DollarSign
                                size={22}
                            />
                        }
                        destaque="verde"
                    />

                    <CardResumo
                        titulo="Gastos hoje"
                        valor={formatarMoeda(
                            totalGastosHoje,
                        )}
                        descricao="Despesas registradas"
                        icone={
                            <WalletCards
                                size={22}
                            />
                        }
                        destaque="vermelho"
                    />

                    <CardResumo
                        titulo="Resultado hoje"
                        valor={formatarMoeda(
                            resultadoHoje,
                        )}
                        descricao={
                            resultadoHoje >=
                                0
                                ? 'Saldo positivo'
                                : 'Saldo negativo'
                        }
                        icone={
                            resultadoHoje >=
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
                            resultadoHoje >=
                                0
                                ? 'verde'
                                : 'vermelho'
                        }
                    />

                    <CardResumo
                        titulo="Vendidos hoje"
                        valor={`${quantidadeVendidaHoje}`}
                        descricao="Unidades vendidas"
                        icone={
                            <ShoppingCart
                                size={22}
                            />
                        }
                        destaque="rosa"
                    />

                    <CardResumo
                        titulo="Estoque total"
                        valor={`${estoqueTotal}`}
                        descricao="Unidades disponíveis"
                        icone={
                            <Package
                                size={22}
                            />
                        }
                        destaque="azul"
                    />
                </section>

                <section className="mt-6 rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">
                                Movimento dos últimos
                                7 dias
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Comparação entre
                                faturamento e gastos
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />

                                Faturamento
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />

                                Gastos
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-b border-zinc-100 pb-5 sm:flex sm:gap-8">
                        <div>
                            <p className="text-xs font-medium text-zinc-400">
                                Faturamento
                            </p>

                            <p className="mt-1 text-lg font-bold text-zinc-900">
                                {formatarMoeda(
                                    faturamento7Dias,
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-zinc-400">
                                Gastos
                            </p>

                            <p className="mt-1 text-lg font-bold text-zinc-900">
                                {formatarMoeda(
                                    gastos7Dias,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex h-64 items-end gap-2 sm:gap-4">
                        {grafico.map(
                            (dia) => {
                                const alturaFaturamento =
                                    dia.faturamento >
                                        0
                                        ? Math.max(
                                            8,
                                            (dia.faturamento /
                                                maiorValorGrafico) *
                                            100,
                                        )
                                        : 2;

                                const alturaGastos =
                                    dia.gastos > 0
                                        ? Math.max(
                                            8,
                                            (dia.gastos /
                                                maiorValorGrafico) *
                                            100,
                                        )
                                        : 2;

                                return (
                                    <div
                                        key={
                                            dia.chave
                                        }
                                        className="flex min-w-0 flex-1 flex-col items-center"
                                    >
                                        <div className="flex h-52 w-full items-end justify-center gap-1 sm:gap-2">
                                            <div
                                                title={`Faturamento: ${formatarMoeda(
                                                    dia.faturamento,
                                                )}`}
                                                className="w-full max-w-7 rounded-t-lg bg-linear-to-t from-pink-600 to-rose-400 transition hover:opacity-80"
                                                style={{
                                                    height: `${alturaFaturamento}%`,
                                                }}
                                            />

                                            <div
                                                title={`Gastos: ${formatarMoeda(
                                                    dia.gastos,
                                                )}`}
                                                className="w-full max-w-7 rounded-t-lg bg-zinc-300 transition hover:bg-zinc-400"
                                                style={{
                                                    height: `${alturaGastos}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="mt-2 truncate text-xs font-semibold capitalize text-zinc-500">
                                            {
                                                dia.label
                                            }
                                        </p>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </section>

                {produtosEstoqueBaixo.length >
                    0 && (
                        <section className="mt-6 overflow-hidden rounded-3xl border border-amber-200/80 bg-linear-to-r from-amber-50 to-orange-50 p-5 shadow-sm sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                    <AlertTriangle
                                        size={22}
                                    />
                                </div>

                                <div className="flex-1">
                                    <h2 className="font-bold text-amber-950">
                                        Atenção ao estoque
                                    </h2>

                                    <p className="mt-1 text-sm text-amber-700">
                                        {produtosEstoqueBaixo.length ===
                                            1
                                            ? '1 produto está com estoque baixo.'
                                            : `${produtosEstoqueBaixo.length} produtos estão com estoque baixo.`}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {produtosEstoqueBaixo.map(
                                            (
                                                produto,
                                            ) => (
                                                <span
                                                    key={
                                                        produto.id
                                                    }
                                                    className="rounded-xl border border-amber-100 bg-white/80 px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm"
                                                >
                                                    {
                                                        produto.nome
                                                    }

                                                    <span className="ml-2 text-amber-600">
                                                        {
                                                            produto.estoque
                                                        }{' '}
                                                        un.
                                                    </span>
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                <section className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:p-6">
                        <CabecalhoSecao
                            titulo="Últimas vendas"
                            descricao="Movimentações realizadas hoje"
                            href="/dashboard/vendas"
                            link="Ver vendas"
                        />

                        {ultimasVendas.length ===
                            0 ? (
                            <EstadoVazio
                                icone={
                                    <ShoppingCart
                                        size={
                                            34
                                        }
                                    />
                                }
                                titulo="Nenhuma venda hoje"
                                descricao="As vendas realizadas hoje aparecerão aqui."
                            />
                        ) : (
                            <div className="mt-5 space-y-2">
                                {ultimasVendas.map(
                                    (
                                        venda,
                                    ) => {
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
                                            <div
                                                key={
                                                    venda.id
                                                }
                                                className="group flex items-center justify-between gap-4 rounded-2xl border border-transparent p-3.5 transition hover:border-zinc-100 hover:bg-zinc-50"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold text-zinc-900">
                                                            Venda #
                                                            {
                                                                venda.id
                                                            }
                                                        </p>

                                                        <span className="rounded-lg bg-pink-50 px-2 py-1 text-[11px] font-bold text-pink-600">
                                                            {formatarPagamento(
                                                                venda.formaPagamento,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-xs text-zinc-400">
                                                        {formatarData(
                                                            venda.createdAt,
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

                                                <p className="shrink-0 font-bold text-zinc-900">
                                                    {formatarMoeda(
                                                        Number(
                                                            venda.total,
                                                        ),
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:p-6">
                        <CabecalhoSecao
                            titulo="Estoque"
                            descricao="Situação atual dos produtos"
                            href="/dashboard/produtos"
                            link="Gerenciar"
                        />

                        {produtos.length ===
                            0 ? (
                            <EstadoVazio
                                icone={
                                    <Package
                                        size={
                                            34
                                        }
                                    />
                                }
                                titulo="Nenhum produto ativo"
                                descricao="Cadastre produtos para acompanhar o estoque."
                            />
                        ) : (
                            <div className="mt-5 space-y-2">
                                {produtos
                                    .slice(
                                        0,
                                        7,
                                    )
                                    .map(
                                        (
                                            produto,
                                        ) => (
                                            <div
                                                key={
                                                    produto.id
                                                }
                                                className="flex items-center justify-between gap-4 rounded-2xl p-3.5 transition hover:bg-zinc-50"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-zinc-900">
                                                        {
                                                            produto.nome
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm text-zinc-400">
                                                        {formatarMoeda(
                                                            Number(
                                                                produto.preco,
                                                            ),
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`h-2.5 w-2.5 rounded-full ${produto.estoque <=
                                                            5
                                                            ? 'bg-red-500'
                                                            : produto.estoque <=
                                                                10
                                                                ? 'bg-amber-400'
                                                                : 'bg-emerald-500'
                                                            }`}
                                                    />

                                                    <div className="text-right">
                                                        <p
                                                            className={`font-bold ${produto.estoque <=
                                                                5
                                                                ? 'text-red-600'
                                                                : 'text-zinc-900'
                                                                }`}
                                                        >
                                                            {
                                                                produto.estoque
                                                            }
                                                        </p>

                                                        <p className="text-[11px] text-zinc-400">
                                                            unidades
                                                        </p>
                                                    </div>
                                                </div>
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
            icone:
                'bg-emerald-50 text-emerald-600',
            detalhe:
                'bg-emerald-500',
        },

        vermelho: {
            icone:
                'bg-red-50 text-red-500',
            detalhe:
                'bg-red-500',
        },

        rosa: {
            icone:
                'bg-pink-50 text-pink-600',
            detalhe:
                'bg-pink-500',
        },

        azul: {
            icone:
                'bg-sky-50 text-sky-600',
            detalhe:
                'bg-sky-500',
        },
    };

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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

interface CabecalhoSecaoProps {
    titulo: string;
    descricao: string;
    href: string;
    link: string;
}

function CabecalhoSecao({
    titulo,
    descricao,
    href,
    link,
}: CabecalhoSecaoProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h2 className="font-bold text-zinc-900">
                    {titulo}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    {descricao}
                </p>
            </div>

            <Link
                href={href}
                className="flex shrink-0 items-center gap-1 text-sm font-semibold text-pink-600 transition hover:text-pink-700"
            >
                {link}

                <ArrowRight
                    size={15}
                />
            </Link>
        </div>
    );
}

interface EstadoVazioProps {
    icone: ReactNode;
    titulo: string;
    descricao: string;
}

function EstadoVazio({
    icone,
    titulo,
    descricao,
}: EstadoVazioProps) {
    return (
        <div className="mt-5 rounded-2xl bg-zinc-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-zinc-300 shadow-sm">
                {icone}
            </div>

            <p className="mt-4 font-semibold text-zinc-700">
                {titulo}
            </p>

            <p className="mx-auto mt-1 max-w-xs text-sm leading-5 text-zinc-500">
                {descricao}
            </p>
        </div>
    );
}