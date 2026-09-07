import {
    AlertTriangle,
    Boxes,
    CircleOff,
    Package,
    PackageCheck,
    PackagePlus,
    Pencil,
} from 'lucide-react';

import Link from 'next/link';

import type { Produto } from '../../../src/generated/prisma/client';
import { prisma } from '../../../src/lib/prisma';

import { AdicionarEstoque } from './AdicionarEstoque';
import { StatusProdutoButton } from './StatusProdutoButton';

function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);
}

export default async function ProdutosPage() {
    const produtos =
        await prisma.produto.findMany({
            orderBy: [
                {
                    ativo: 'desc',
                },
                {
                    nome: 'asc',
                },
            ],
        });

    const produtosAtivos =
        produtos.filter(
            (produto) =>
                produto.ativo,
        );

    const produtosDesativados =
        produtos.filter(
            (produto) =>
                !produto.ativo,
        );

    const estoqueTotal =
        produtosAtivos.reduce(
            (total, produto) =>
                total +
                produto.estoque,
            0,
        );

    const estoqueBaixo =
        produtosAtivos.filter(
            (produto) =>
                produto.estoque <= 5,
        );

    const semEstoque =
        produtosAtivos.filter(
            (produto) =>
                produto.estoque === 0,
        );

    return (
        <main className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-pink-600">
                            Catálogo e estoque
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                            Produtos
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                            Gerencie os sabores,
                            preços e estoque dos
                            produtos disponíveis
                            para venda.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/produtos/novo"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                        <PackagePlus
                            size={19}
                        />

                        Novo produto
                    </Link>
                </div>

                <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <CardResumo
                        titulo="Produtos ativos"
                        valor={`${produtosAtivos.length}`}
                        descricao="Disponíveis para venda"
                        icone={
                            <PackageCheck
                                size={22}
                            />
                        }
                        destaque="verde"
                    />

                    <CardResumo
                        titulo="Estoque total"
                        valor={`${estoqueTotal}`}
                        descricao="Unidades disponíveis"
                        icone={
                            <Boxes
                                size={22}
                            />
                        }
                        destaque="azul"
                    />

                    <CardResumo
                        titulo="Estoque baixo"
                        valor={`${estoqueBaixo.length}`}
                        descricao="5 unidades ou menos"
                        icone={
                            <AlertTriangle
                                size={22}
                            />
                        }
                        destaque={
                            estoqueBaixo.length >
                                0
                                ? 'amarelo'
                                : 'verde'
                        }
                    />

                    <CardResumo
                        titulo="Desativados"
                        valor={`${produtosDesativados.length}`}
                        descricao="Fora da tela de vendas"
                        icone={
                            <CircleOff
                                size={22}
                            />
                        }
                        destaque="cinza"
                    />
                </section>

                {semEstoque.length >
                    0 && (
                        <section className="mb-7 rounded-3xl border border-red-200/80 bg-gradient-to-r from-red-50 to-rose-50 p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                                    <AlertTriangle
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h2 className="font-bold text-red-950">
                                        Produtos sem
                                        estoque
                                    </h2>

                                    <p className="mt-1 text-sm text-red-700">
                                        Esses produtos não
                                        poderão ser vendidos
                                        até o estoque ser
                                        reposto.
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {semEstoque.map(
                                            (
                                                produto,
                                            ) => (
                                                <span
                                                    key={
                                                        produto.id
                                                    }
                                                    className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-700"
                                                >
                                                    {
                                                        produto.nome
                                                    }
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                <section>
                    <CabecalhoSecao
                        titulo="Produtos ativos"
                        descricao="Sabores disponíveis para venda"
                        quantidade={
                            produtosAtivos.length
                        }
                    />

                    {produtosAtivos.length ===
                        0 ? (
                        <EstadoVazio />
                    ) : (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {produtosAtivos.map(
                                (
                                    produto,
                                ) => (
                                    <ProdutoCard
                                        key={
                                            produto.id
                                        }
                                        produto={
                                            produto
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}
                </section>

                {produtosDesativados.length >
                    0 && (
                        <section className="mt-10">
                            <CabecalhoSecao
                                titulo="Produtos desativados"
                                descricao="Não aparecem na tela de vendas"
                                quantidade={
                                    produtosDesativados.length
                                }
                            />

                            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {produtosDesativados.map(
                                    (
                                        produto,
                                    ) => (
                                        <ProdutoCard
                                            key={
                                                produto.id
                                            }
                                            produto={
                                                produto
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        </section>
                    )}
            </div>
        </main>
    );
}

interface ProdutoCardProps {
    produto: Produto;
}

function ProdutoCard({
    produto,
}: ProdutoCardProps) {
    const estoqueBaixo =
        produto.ativo &&
        produto.estoque <= 5;

    const semEstoque =
        produto.ativo &&
        produto.estoque === 0;

    const status =
        semEstoque
            ? {
                texto:
                    'Sem estoque',
                classe:
                    'bg-red-50 text-red-600',
                ponto:
                    'bg-red-500',
            }
            : estoqueBaixo
                ? {
                    texto:
                        'Estoque baixo',
                    classe:
                        'bg-amber-50 text-amber-700',
                    ponto:
                        'bg-amber-400',
                }
                : {
                    texto:
                        'Disponível',
                    classe:
                        'bg-emerald-50 text-emerald-700',
                    ponto:
                        'bg-emerald-500',
                };

    return (
        <article
            className={`group relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${produto.ativo
                    ? 'border-zinc-200/70'
                    : 'border-zinc-200 opacity-70'
                }`}
        >
            <div
                className={`absolute inset-x-0 top-0 h-1 ${produto.ativo
                        ? semEstoque
                            ? 'bg-red-500'
                            : estoqueBaixo
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                        : 'bg-zinc-300'
                    }`}
            />

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-bold text-zinc-900">
                            {produto.nome}
                        </h2>

                        {!produto.ativo && (
                            <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-500">
                                Desativado
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-sm font-medium text-zinc-500">
                        {formatarMoeda(
                            Number(
                                produto.preco,
                            ),
                        )}
                    </p>
                </div>

                <Link
                    href={`/dashboard/produtos/${produto.id}/editar`}
                    title="Editar produto"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
                >
                    <Pencil size={16} />
                </Link>
            </div>

            <div className="my-5 h-px bg-zinc-100" />

            <div>
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-500">
                        Estoque atual
                    </p>

                    {produto.ativo && (
                        <span
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${status.classe}`}
                        >
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${status.ponto}`}
                            />

                            {
                                status.texto
                            }
                        </span>
                    )}
                </div>

                <div className="mt-2 flex items-baseline gap-1.5">
                    <p
                        className={`text-3xl font-bold tracking-tight ${semEstoque
                                ? 'text-red-600'
                                : 'text-zinc-900'
                            }`}
                    >
                        {produto.estoque}
                    </p>

                    <span className="text-sm text-zinc-400">
                        unidades
                    </span>
                </div>
            </div>

            <div className="mt-5 space-y-2">
                {produto.ativo && (
                    <AdicionarEstoque
                        produtoId={
                            produto.id
                        }
                        produtoNome={
                            produto.nome
                        }
                        estoqueAtual={
                            produto.estoque
                        }
                    />
                )}

                <StatusProdutoButton
                    produtoId={
                        produto.id
                    }
                    produtoNome={
                        produto.nome
                    }
                    ativo={
                        produto.ativo
                    }
                />
            </div>
        </article>
    );
}

interface CabecalhoSecaoProps {
    titulo: string;
    descricao: string;
    quantidade: number;
}

function CabecalhoSecao({
    titulo,
    descricao,
    quantidade,
}: CabecalhoSecaoProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <h2 className="text-lg font-bold text-zinc-900">
                    {titulo}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    {descricao}
                </p>
            </div>

            <span className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-bold text-zinc-600 shadow-sm">
                {quantidade}
            </span>
        </div>
    );
}

type Destaque =
    | 'verde'
    | 'azul'
    | 'amarelo'
    | 'cinza';

interface CardResumoProps {
    titulo: string;
    valor: string;
    descricao: string;
    icone: React.ReactNode;
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

        azul: {
            detalhe:
                'bg-sky-500',
            icone:
                'bg-sky-50 text-sky-600',
        },

        amarelo: {
            detalhe:
                'bg-amber-400',
            icone:
                'bg-amber-50 text-amber-600',
        },

        cinza: {
            detalhe:
                'bg-zinc-300',
            icone:
                'bg-zinc-100 text-zinc-500',
        },
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <div
                className={`absolute inset-x-0 top-0 h-1 ${estilos[destaque].detalhe}`}
            />

            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-zinc-500">
                        {titulo}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-zinc-900">
                        {valor}
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                        {descricao}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${estilos[destaque].icone}`}
                >
                    {icone}
                </div>
            </div>
        </div>
    );
}

function EstadoVazio() {
    return (
        <div className="mt-5 rounded-3xl border border-zinc-200/70 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-300">
                <Package size={30} />
            </div>

            <h2 className="mt-4 font-bold text-zinc-900">
                Nenhum produto ativo
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
                Cadastre ou reative um
                produto para começar.
            </p>
        </div>
    );
}