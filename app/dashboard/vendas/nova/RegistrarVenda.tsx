'use client';

import {
    ArrowLeft,
    Banknote,
    Check,
    CreditCard,
    LoaderCircle,
    Minus,
    Package,
    Plus,
    QrCode,
    ShoppingBag,
    ShoppingCart,
} from 'lucide-react';

import Link from 'next/link';

import {
    useMemo,
    useState,
} from 'react';

interface Produto {
    id: number;
    nome: string;
    preco: number;
    estoque: number;
}

interface RegistrarVendaProps {
    produtos: Produto[];
}

type FormaPagamento =
    | 'PIX'
    | 'DINHEIRO'
    | 'CARTAO';

export function RegistrarVenda({
    produtos,
}: RegistrarVendaProps) {
    const [
        quantidades,
        setQuantidades,
    ] = useState<
        Record<number, number>
    >({});

    const [
        formaPagamento,
        setFormaPagamento,
    ] =
        useState<FormaPagamento>(
            'PIX',
        );

    const [
        salvando,
        setSalvando,
    ] = useState(false);

    const [erro, setErro] =
        useState('');

    function quantidadeProduto(
        produtoId: number,
    ) {
        return (
            quantidades[
            produtoId
            ] ?? 0
        );
    }

    function adicionar(
        produto: Produto,
    ) {
        const atual =
            quantidadeProduto(
                produto.id,
            );

        if (
            atual >=
            produto.estoque
        ) {
            return;
        }

        setQuantidades(
            (anterior) => ({
                ...anterior,

                [produto.id]:
                    atual + 1,
            }),
        );
    }

    function remover(
        produto: Produto,
    ) {
        const atual =
            quantidadeProduto(
                produto.id,
            );

        if (atual <= 0) {
            return;
        }

        setQuantidades(
            (anterior) => ({
                ...anterior,

                [produto.id]:
                    atual - 1,
            }),
        );
    }

    const itensSelecionados =
        useMemo(() => {
            return produtos
                .map(
                    (produto) => ({
                        ...produto,

                        quantidade:
                            quantidades[
                            produto.id
                            ] ?? 0,
                    }),
                )
                .filter(
                    (produto) =>
                        produto.quantidade >
                        0,
                );
        }, [
            produtos,
            quantidades,
        ]);

    const quantidadeTotal =
        itensSelecionados.reduce(
            (total, item) =>
                total +
                item.quantidade,
            0,
        );

    const valorTotal =
        itensSelecionados.reduce(
            (total, item) =>
                total +
                item.preco *
                item.quantidade,
            0,
        );

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

    async function finalizarVenda() {
        if (
            itensSelecionados.length ===
            0
        ) {
            setErro(
                'Selecione pelo menos um produto.',
            );

            return;
        }

        setErro('');
        setSalvando(true);

        try {
            const response =
                await fetch(
                    '/api/vendas',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',
                        },

                        body: JSON.stringify({
                            formaPagamento,

                            itens: itensSelecionados.map(
                                (
                                    item,
                                ) => ({
                                    produtoId:
                                        item.id,

                                    quantidade:
                                        item.quantidade,
                                }),
                            ),
                        }),
                    },
                );

            const data =
                await response.json();

            if (!response.ok) {
                setErro(
                    data.erro ??
                    'Não foi possível registrar a venda.',
                );

                return;
            }

            window.location.href =
                '/dashboard?venda=sucesso';
        } catch {
            setErro(
                'Não foi possível registrar a venda.',
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
                <Link
                    href="/dashboard/vendas"
                    className="mb-6 inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                >
                    <ArrowLeft
                        size={17}
                    />

                    Voltar para vendas
                </Link>

                <div className="mb-8">
                    <p className="mb-1 text-sm font-semibold text-pink-600">
                        Nova venda
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                        Registrar venda
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                        Selecione os produtos
                        vendidos e escolha a forma
                        de pagamento.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
                    <section>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-bold text-zinc-900">
                                    Produtos disponíveis
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Clique em + para
                                    adicionar à venda.
                                </p>
                            </div>

                            <span className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-bold text-zinc-600 shadow-sm">
                                {produtos.length}
                            </span>
                        </div>

                        {produtos.length ===
                            0 ? (
                            <div className="rounded-3xl border border-zinc-200/70 bg-white p-12 text-center shadow-sm">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-300">
                                    <Package
                                        size={
                                            30
                                        }
                                    />
                                </div>

                                <h2 className="mt-4 font-bold text-zinc-900">
                                    Nenhum produto
                                    disponível
                                </h2>

                                <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                                    Adicione produtos
                                    ao estoque antes
                                    de registrar uma
                                    venda.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {produtos.map(
                                    (
                                        produto,
                                    ) => {
                                        const quantidade =
                                            quantidadeProduto(
                                                produto.id,
                                            );

                                        const selecionado =
                                            quantidade >
                                            0;

                                        return (
                                            <article
                                                key={
                                                    produto.id
                                                }
                                                className={`relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition ${selecionado
                                                    ? 'border-pink-300 ring-2 ring-pink-100'
                                                    : 'border-zinc-200/70 hover:-translate-y-0.5 hover:shadow-md'
                                                    }`}
                                            >
                                                {selecionado && (
                                                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-pink-600 to-rose-400" />
                                                )}

                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h2 className="truncate font-bold text-zinc-900">
                                                            {
                                                                produto.nome
                                                            }
                                                        </h2>

                                                        <p className="mt-1 text-lg font-bold text-pink-600">
                                                            {formatarMoeda(
                                                                produto.preco,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${produto.estoque <=
                                                            5
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-emerald-50 text-emerald-700'
                                                            }`}
                                                    >
                                                        {
                                                            produto.estoque
                                                        }{' '}
                                                        un.
                                                    </span>
                                                </div>

                                                <div className="mt-5 rounded-2xl bg-zinc-50 p-2">
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                remover(
                                                                    produto,
                                                                )
                                                            }
                                                            disabled={
                                                                quantidade ===
                                                                0
                                                            }
                                                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            <Minus
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>

                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-zinc-900">
                                                                {
                                                                    quantidade
                                                                }
                                                            </p>

                                                            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                                                                quantidade
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                adicionar(
                                                                    produto,
                                                                )
                                                            }
                                                            disabled={
                                                                quantidade >=
                                                                produto.estoque
                                                            }
                                                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-600 text-white shadow-md shadow-pink-500/20 transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            <Plus
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </section>

                    <aside>
                        <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-lg shadow-zinc-900/4 sm:p-6 lg:sticky lg:top-40">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
                                    <ShoppingBag
                                        size={
                                            21
                                        }
                                    />
                                </div>

                                <div>
                                    <h2 className="font-bold text-zinc-900">
                                        Resumo da venda
                                    </h2>

                                    <p className="text-xs text-zinc-400">
                                        {
                                            quantidadeTotal
                                        }{' '}
                                        {quantidadeTotal ===
                                            1
                                            ? 'item selecionado'
                                            : 'itens selecionados'}
                                    </p>
                                </div>
                            </div>

                            {itensSelecionados.length ===
                                0 ? (
                                <div className="my-6 rounded-2xl bg-zinc-50 py-8 text-center">
                                    <ShoppingCart
                                        size={
                                            32
                                        }
                                        className="mx-auto text-zinc-300"
                                    />

                                    <p className="mt-3 text-sm font-medium text-zinc-500">
                                        Nenhum produto
                                        selecionado.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-2">
                                    {itensSelecionados.map(
                                        (
                                            item,
                                        ) => (
                                            <div
                                                key={
                                                    item.id
                                                }
                                                className="flex justify-between gap-4 rounded-xl bg-zinc-50 px-3 py-3 text-sm"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-zinc-800">
                                                        {
                                                            item.nome
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-zinc-400">
                                                        {
                                                            item.quantidade
                                                        }{' '}
                                                        ×{' '}
                                                        {formatarMoeda(
                                                            item.preco,
                                                        )}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 font-bold text-zinc-900">
                                                    {formatarMoeda(
                                                        item.preco *
                                                        item.quantidade,
                                                    )}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                            <div className="my-6 h-px bg-zinc-100" />

                            <div>
                                <p className="mb-3 text-sm font-bold text-zinc-700">
                                    Forma de pagamento
                                </p>

                                <div className="grid grid-cols-3 gap-2">
                                    <PagamentoButton
                                        ativo={
                                            formaPagamento ===
                                            'PIX'
                                        }
                                        label="PIX"
                                        icone={
                                            <QrCode
                                                size={
                                                    19
                                                }
                                            />
                                        }
                                        onClick={() =>
                                            setFormaPagamento(
                                                'PIX',
                                            )
                                        }
                                    />

                                    <PagamentoButton
                                        ativo={
                                            formaPagamento ===
                                            'DINHEIRO'
                                        }
                                        label="Dinheiro"
                                        icone={
                                            <Banknote
                                                size={
                                                    19
                                                }
                                            />
                                        }
                                        onClick={() =>
                                            setFormaPagamento(
                                                'DINHEIRO',
                                            )
                                        }
                                    />

                                    <PagamentoButton
                                        ativo={
                                            formaPagamento ===
                                            'CARTAO'
                                        }
                                        label="Cartão"
                                        icone={
                                            <CreditCard
                                                size={
                                                    19
                                                }
                                            />
                                        }
                                        onClick={() =>
                                            setFormaPagamento(
                                                'CARTAO',
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="my-6 h-px bg-zinc-100" />

                            <div className="rounded-2xl bg-linear-to-br from-pink-50 to-rose-50 p-4">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
                                            Total
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            {
                                                quantidadeTotal
                                            }{' '}
                                            {quantidadeTotal ===
                                                1
                                                ? 'unidade'
                                                : 'unidades'}
                                        </p>
                                    </div>

                                    <p className="text-2xl font-bold tracking-tight text-zinc-900">
                                        {formatarMoeda(
                                            valorTotal,
                                        )}
                                    </p>
                                </div>
                            </div>

                            {erro && (
                                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                    {erro}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={
                                    finalizarVenda
                                }
                                disabled={
                                    salvando ||
                                    itensSelecionados.length ===
                                    0
                                }
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-pink-600 to-rose-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                            >
                                {salvando ? (
                                    <LoaderCircle
                                        size={
                                            19
                                        }
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Check
                                        size={
                                            19
                                        }
                                    />
                                )}

                                {salvando
                                    ? 'Registrando...'
                                    : 'Finalizar venda'}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

interface PagamentoButtonProps {
    ativo: boolean;
    label: string;
    icone: React.ReactNode;
    onClick: () => void;
}

function PagamentoButton({
    ativo,
    label,
    icone,
    onClick,
}: PagamentoButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-bold transition ${ativo
                ? 'border-pink-300 bg-pink-50 text-pink-600 ring-2 ring-pink-100'
                : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                }`}
        >
            {icone}

            <span className="truncate">
                {label}
            </span>
        </button>
    );
}