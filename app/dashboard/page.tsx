import {
    DollarSign,
    Package,
    Plus,
    ReceiptText,
    ShoppingCart,
    TrendingUp,
} from 'lucide-react';

import Link from 'next/link';

import { prisma } from '../../src/lib/prisma';
import { LogoutButton } from './LogoutButton';

function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);
}

function formatarFormaPagamento(forma: string) {
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
    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const fimHoje = new Date();
    fimHoje.setHours(23, 59, 59, 999);

    const vendasHoje = await prisma.venda.findMany({
        where: {
            createdAt: {
                gte: inicioHoje,
                lte: fimHoje,
            },
        },
        include: {
            itens: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const gastosHoje = await prisma.gasto.findMany({
        where: {
            createdAt: {
                gte: inicioHoje,
                lte: fimHoje,
            },
        },
    });

    const produtos = await prisma.produto.findMany({
        where: {
            ativo: true,
        },
        orderBy: {
            estoque: 'asc',
        },
    });

    const faturamentoHoje = vendasHoje.reduce(
        (total, venda) => total + Number(venda.total),
        0,
    );

    const totalGastosHoje = gastosHoje.reduce(
        (total, gasto) => total + Number(gasto.valor),
        0,
    );

    const quantidadeVendidaHoje = vendasHoje.reduce(
        (total, venda) =>
            total +
            venda.itens.reduce(
                (subtotal, item) =>
                    subtotal + item.quantidade,
                0,
            ),
        0,
    );

    const estoqueTotal = produtos.reduce(
        (total, produto) =>
            total + produto.estoque,
        0,
    );

    const resultadoHoje =
        faturamentoHoje - totalGastosHoje;

    const produtosEstoqueBaixo = produtos
        .filter((produto) => produto.estoque <= 5)
        .slice(0, 5);

    const ultimasVendas = vendasHoje.slice(0, 5);

    return (
        <main className="min-h-screen bg-zinc-100">
            <header className="border-b border-zinc-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
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
            </header>

            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">
                            Dashboard
                        </h2>

                        <p className="mt-1 text-zinc-500">
                            Resumo das vendas de hoje
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

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <CardDashboard
                        titulo="Faturamento hoje"
                        valor={formatarMoeda(
                            faturamentoHoje,
                        )}
                        icone={
                            <DollarSign size={22} />
                        }
                    />

                    <CardDashboard
                        titulo="Vendidos hoje"
                        valor={`${quantidadeVendidaHoje}`}
                        complemento="unidades"
                        icone={
                            <ShoppingCart size={22} />
                        }
                    />

                    <CardDashboard
                        titulo="Gastos hoje"
                        valor={formatarMoeda(
                            totalGastosHoje,
                        )}
                        icone={
                            <ReceiptText size={22} />
                        }
                    />

                    <CardDashboard
                        titulo="Resultado hoje"
                        valor={formatarMoeda(
                            resultadoHoje,
                        )}
                        icone={
                            <TrendingUp size={22} />
                        }
                    />

                    <CardDashboard
                        titulo="Estoque total"
                        valor={`${estoqueTotal}`}
                        complemento="unidades"
                        icone={
                            <Package size={22} />
                        }
                    />
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900">
                                    Estoque baixo
                                </h3>

                                <p className="text-sm text-zinc-500">
                                    Produtos com 5 unidades ou menos
                                </p>
                            </div>

                            <Link
                                href="/dashboard/produtos"
                                className="text-sm font-semibold text-pink-600 transition hover:text-pink-700"
                            >
                                Ver produtos
                            </Link>
                        </div>

                        {produtosEstoqueBaixo.length ===
                            0 ? (
                            <div className="rounded-xl bg-zinc-50 p-5 text-center">
                                <Package
                                    size={30}
                                    className="mx-auto text-zinc-300"
                                />

                                <p className="mt-2 text-sm text-zinc-500">
                                    Nenhum produto com estoque
                                    baixo.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {produtosEstoqueBaixo.map(
                                    (produto) => (
                                        <div
                                            key={
                                                produto.id
                                            }
                                            className="flex items-center justify-between rounded-xl border border-zinc-200 p-4"
                                        >
                                            <div>
                                                <p className="font-medium text-zinc-900">
                                                    {
                                                        produto.nome
                                                    }
                                                </p>

                                                <p className="text-sm text-zinc-500">
                                                    {formatarMoeda(
                                                        Number(
                                                            produto.preco,
                                                        ),
                                                    )}
                                                </p>
                                            </div>

                                            <span className="rounded-lg bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                                                {
                                                    produto.estoque
                                                }{' '}
                                                un.
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-5">
                            <h3 className="text-lg font-semibold text-zinc-900">
                                Últimas vendas
                            </h3>

                            <p className="text-sm text-zinc-500">
                                Vendas registradas hoje
                            </p>
                        </div>

                        {ultimasVendas.length === 0 ? (
                            <div className="rounded-xl bg-zinc-50 p-5 text-center">
                                <ShoppingCart
                                    size={30}
                                    className="mx-auto text-zinc-300"
                                />

                                <p className="mt-2 text-sm text-zinc-500">
                                    Nenhuma venda registrada
                                    hoje.
                                </p>

                                <Link
                                    href="/dashboard/vendas/nova"
                                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700"
                                >
                                    <Plus size={16} />
                                    Registrar primeira venda
                                </Link>
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
                                                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4"
                                            >
                                                <div>
                                                    <p className="font-medium text-zinc-900">
                                                        Venda #
                                                        {
                                                            venda.id
                                                        }
                                                    </p>

                                                    <p className="text-sm text-zinc-500">
                                                        {
                                                            quantidade
                                                        }{' '}
                                                        {quantidade ===
                                                            1
                                                            ? 'item'
                                                            : 'itens'}{' '}
                                                        •{' '}
                                                        {formatarFormaPagamento(
                                                            venda.formaPagamento,
                                                        )}
                                                    </p>
                                                </div>

                                                <span className="whitespace-nowrap font-semibold text-zinc-900">
                                                    {formatarMoeda(
                                                        Number(
                                                            venda.total,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

interface CardDashboardProps {
    titulo: string;
    valor: string;
    complemento?: string;
    icone: React.ReactNode;
}

function CardDashboard({
    titulo,
    valor,
    complemento,
    icone,
}: CardDashboardProps) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                {icone}
            </div>

            <p className="text-sm font-medium text-zinc-500">
                {titulo}
            </p>

            <div className="mt-1 flex items-baseline gap-1">
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
    );
}