import {
    Package,
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
            (produto) => produto.ativo,
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

    return (
        <main className="min-h-screen bg-zinc-100">
            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Produtos
                        </h1>

                        <p className="mt-1 text-zinc-500">
                            Controle dos sabores e estoque
                        </p>
                    </div>

                    <Link
                        href="/dashboard/produtos/novo"
                        className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700"
                    >
                        <PackagePlus size={18} />

                        Novo produto
                    </Link>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <CardResumo
                        titulo="Produtos ativos"
                        valor={`${produtosAtivos.length}`}
                    />

                    <CardResumo
                        titulo="Desativados"
                        valor={`${produtosDesativados.length}`}
                    />

                    <CardResumo
                        titulo="Estoque total"
                        valor={`${estoqueTotal}`}
                        complemento="unidades"
                    />
                </div>

                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-zinc-900">
                            Produtos ativos
                        </h2>

                        <p className="text-sm text-zinc-500">
                            Sabores disponíveis para venda
                        </p>
                    </div>

                    {produtosAtivos.length === 0 ? (
                        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                            <Package
                                size={40}
                                className="mx-auto mb-3 text-zinc-300"
                            />

                            <h2 className="font-semibold text-zinc-900">
                                Nenhum produto ativo
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Cadastre ou reative um produto.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {produtosAtivos.map(
                                (produto) => (
                                    <ProdutoCard
                                        key={produto.id}
                                        produto={produto}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </section>

                {produtosDesativados.length >
                    0 && (
                        <section className="mt-10">
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-zinc-900">
                                    Produtos desativados
                                </h2>

                                <p className="text-sm text-zinc-500">
                                    Não aparecem na tela de vendas
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {produtosDesativados.map(
                                    (produto) => (
                                        <ProdutoCard
                                            key={produto.id}
                                            produto={produto}
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
    return (
        <div
            className={`rounded-2xl bg-white p-5 shadow-sm ${!produto.ativo
                    ? 'opacity-75'
                    : ''
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-zinc-900">
                            {produto.nome}
                        </h2>

                        {!produto.ativo && (
                            <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
                                Desativado
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-sm text-zinc-500">
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
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                >
                    <Pencil size={18} />
                </Link>
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-4">
                <p className="text-sm text-zinc-500">
                    Estoque
                </p>

                <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-2xl font-bold text-zinc-900">
                        {produto.estoque}

                        <span className="ml-1 text-sm font-normal text-zinc-500">
                            unidades
                        </span>
                    </p>

                    {produto.ativo &&
                        produto.estoque <= 5 && (
                            <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                Estoque baixo
                            </span>
                        )}
                </div>
            </div>

            {produto.ativo && (
                <AdicionarEstoque
                    produtoId={produto.id}
                    produtoNome={produto.nome}
                    estoqueAtual={produto.estoque}
                />
            )}

            <StatusProdutoButton
                produtoId={produto.id}
                produtoNome={produto.nome}
                ativo={produto.ativo}
            />
        </div>
    );
}

interface CardResumoProps {
    titulo: string;
    valor: string;
    complemento?: string;
}

function CardResumo({
    titulo,
    valor,
    complemento,
}: CardResumoProps) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">
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