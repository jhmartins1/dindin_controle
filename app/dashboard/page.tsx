import {
    AlertTriangle,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

import Link from 'next/link';

import { prisma } from '../../src/lib/prisma';

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

export default async function DashboardPage() {
    const agora = new Date();

    const inicioHoje = new Date(agora);
    inicioHoje.setHours(0, 0, 0, 0);

    const fimHoje = new Date(agora);
    fimHoje.setHours(23, 59, 59, 999);

    const [
        vendasHoje,
        gastosHoje,
        produtos,
    ] = await Promise.all([
        prisma.venda.findMany({
            where: {
                cancelada: false,

                createdAt: {
                    gte: inicioHoje,
                    lte: fimHoje,
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
                    gte: inicioHoje,
                    lte: fimHoje,
                },
            },

            orderBy: {
                createdAt: 'desc',
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

    const faturamentoHoje =
        vendasHoje.reduce(
            (total, venda) =>
                total + Number(venda.total),
            0,
        );

    const totalGastosHoje =
        gastosHoje.reduce(
            (total, gasto) =>
                total + Number(gasto.valor),
            0,
        );

    const resultadoHoje =
        faturamentoHoje - totalGastosHoje;

    const quantidadeVendidaHoje =
        vendasHoje.reduce(
            (total, venda) =>
                total +
                venda.itens.reduce(
                    (subtotal, item) =>
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

    return (
        <main className="min-h-screen bg-zinc-100">
            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Dashboard
                        </h1>

                        <p className="mt-1 text-zinc-500">
                            Resumo do dia
                        </p>
                    </div>

                    <Link
                        href="/dashboard/vendas/nova"
                        className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
                    >
                        <ShoppingCart size={19} />

                        Registrar venda
                    </Link>
                </div>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <CardResumo
                        titulo="Faturamento hoje"
                        valor={formatarMoeda(
                            faturamentoHoje,
                        )}
                        icone={
                            <DollarSign
                                size={22}
                            />
                        }
                    />

                    <CardResumo
                        titulo="Gastos hoje"
                        valor={formatarMoeda(
                            totalGastosHoje,
                        )}
                        icone={
                            <TrendingDown
                                size={22}
                            />
                        }
                    />

                    <CardResumo
                        titulo="Resultado hoje"
                        valor={formatarMoeda(
                            resultadoHoje,
                        )}
                        icone={
                            resultadoHoje >=
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
                        titulo="Vendidos hoje"
                        valor={`${quantidadeVendidaHoje}`}
                        complemento="unidades"
                        icone={
                            <ShoppingCart
                                size={22}
                            />
                        }
                    />

                    <CardResumo
                        titulo="Estoque total"
                        valor={`${estoqueTotal}`}
                        complemento="unidades"
                        icone={
                            <Package
                                size={22}
                            />
                        }
                    />
                </section>

                {produtosEstoqueBaixo.length >
                    0 && (
                        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                                    <AlertTriangle
                                        size={22}
                                    />
                                </div>

                                <div className="flex-1">
                                    <h2 className="font-bold text-amber-900">
                                        Estoque baixo
                                    </h2>

                                    <p className="mt-1 text-sm text-amber-700">
                                        Alguns produtos estão
                                        com 5 unidades ou menos.
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {produtosEstoqueBaixo.map(
                                            (produto) => (
                                                <span
                                                    key={
                                                        produto.id
                                                    }
                                                    className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-amber-800 shadow-sm"
                                                >
                                                    {
                                                        produto.nome
                                                    }
                                                    :{' '}
                                                    {
                                                        produto.estoque
                                                    }
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="font-bold text-zinc-900">
                                    Últimas vendas
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Vendas realizadas hoje
                                </p>
                            </div>

                            <Link
                                href="/dashboard/vendas"
                                className="text-sm font-semibold text-pink-600 transition hover:text-pink-700"
                            >
                                Ver todas
                            </Link>
                        </div>

                        {ultimasVendas.length ===
                            0 ? (
                            <div className="rounded-xl bg-zinc-50 p-8 text-center">
                                <ShoppingCart
                                    size={36}
                                    className="mx-auto text-zinc-300"
                                />

                                <p className="mt-3 font-medium text-zinc-700">
                                    Nenhuma venda hoje
                                </p>

                                <p className="mt-1 text-sm text-zinc-500">
                                    As vendas do dia
                                    aparecerão aqui.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {ultimasVendas.map(
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
                                            <div
                                                key={
                                                    venda.id
                                                }
                                                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 p-4"
                                            >
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold text-zinc-900">
                                                            Venda #
                                                            {
                                                                venda.id
                                                            }
                                                        </p>

                                                        <span className="rounded-lg bg-pink-50 px-2 py-1 text-xs font-semibold text-pink-600">
                                                            {formatarPagamento(
                                                                venda.formaPagamento,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-xs text-zinc-500">
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

                                                <p className="font-bold text-zinc-900">
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

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="font-bold text-zinc-900">
                                    Produtos
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Estoque atual dos sabores
                                </p>
                            </div>

                            <Link
                                href="/dashboard/produtos"
                                className="text-sm font-semibold text-pink-600 transition hover:text-pink-700"
                            >
                                Gerenciar
                            </Link>
                        </div>

                        {produtos.length ===
                            0 ? (
                            <div className="rounded-xl bg-zinc-50 p-8 text-center">
                                <Package
                                    size={36}
                                    className="mx-auto text-zinc-300"
                                />

                                <p className="mt-3 font-medium text-zinc-700">
                                    Nenhum produto ativo
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {produtos
                                    .slice(0, 8)
                                    .map(
                                        (
                                            produto,
                                        ) => (
                                            <div
                                                key={
                                                    produto.id
                                                }
                                                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 p-4"
                                            >
                                                <div>
                                                    <p className="font-medium text-zinc-900">
                                                        {
                                                            produto.nome
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm text-zinc-500">
                                                        {formatarMoeda(
                                                            Number(
                                                                produto.preco,
                                                            ),
                                                        )}
                                                    </p>
                                                </div>

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
                </section>
            </div>
        </main>
    );
}

interface CardResumoProps {
    titulo: string;
    valor: string;
    complemento?: string;
    icone: React.ReactNode;
}

function CardResumo({
    titulo,
    valor,
    complemento,
    icone,
}: CardResumoProps) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-zinc-500">
                        {titulo}
                    </p>

                    <div className="mt-2 flex flex-wrap items-baseline gap-1">
                        <p className="text-2xl font-bold text-zinc-900">
                            {valor}
                        </p>

                        {complemento && (
                            <span className="text-sm text-zinc-500">
                                {complemento}
                            </span>
                        )}
                    </div>
                </div>

                <div className="rounded-xl bg-pink-50 p-3 text-pink-600">
                    {icone}
                </div>
            </div>
        </div>
    );
}