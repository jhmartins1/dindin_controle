import {
    Package,
    PackagePlus,
    Pencil,
} from 'lucide-react';
import Link from 'next/link';

import { prisma } from '../../../src/lib/prisma';
import { AdicionarEstoque } from './AdicionarEstoque';

function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(valor);
}

export default async function ProdutosPage() {
    const produtos = await prisma.produto.findMany({
        where: {
            ativo: true,
        },
        orderBy: {
            nome: 'asc',
        },
    });

    const estoqueTotal = produtos.reduce(
        (total, produto) => total + produto.estoque,
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

                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                        <Package size={21} />
                    </div>

                    <div>
                        <p className="text-sm text-zinc-500">
                            Estoque total
                        </p>

                        <p className="text-xl font-bold text-zinc-900">
                            {estoqueTotal}{' '}
                            <span className="text-sm font-normal text-zinc-500">
                                unidades
                            </span>
                        </p>
                    </div>
                </div>

                {produtos.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <Package
                            size={40}
                            className="mx-auto mb-3 text-zinc-300"
                        />

                        <h2 className="font-semibold text-zinc-900">
                            Nenhum produto cadastrado
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Cadastre o primeiro sabor para começar.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {produtos.map((produto) => (
                            <div
                                key={produto.id}
                                className="rounded-2xl bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-zinc-900">
                                            {produto.nome}
                                        </h2>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            {formatarMoeda(
                                                Number(produto.preco),
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

                                    <div className="mt-1 flex items-center justify-between">
                                        <p className="text-2xl font-bold text-zinc-900">
                                            {produto.estoque}
                                            <span className="ml-1 text-sm font-normal text-zinc-500">
                                                unidades
                                            </span>
                                        </p>

                                        {produto.estoque <= 5 && (
                                            <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                                Estoque baixo
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <AdicionarEstoque
                                    produtoId={produto.id}
                                    produtoNome={produto.nome}
                                    estoqueAtual={produto.estoque}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}