'use client';

import {
    ArrowLeft,
    Banknote,
    Check,
    CreditCard,
    Minus,
    Plus,
    QrCode,
    ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

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
    const [quantidades, setQuantidades] = useState<
        Record<number, number>
    >({});

    const [formaPagamento, setFormaPagamento] =
        useState<FormaPagamento>('PIX');

    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    function quantidadeProduto(produtoId: number) {
        return quantidades[produtoId] ?? 0;
    }

    function adicionar(produto: Produto) {
        const atual = quantidadeProduto(produto.id);

        if (atual >= produto.estoque) {
            return;
        }

        setQuantidades((anterior) => ({
            ...anterior,
            [produto.id]: atual + 1,
        }));
    }

    function remover(produto: Produto) {
        const atual = quantidadeProduto(produto.id);

        if (atual <= 0) {
            return;
        }

        setQuantidades((anterior) => ({
            ...anterior,
            [produto.id]: atual - 1,
        }));
    }

    const itensSelecionados = useMemo(() => {
        return produtos
            .map((produto) => ({
                ...produto,
                quantidade: quantidades[produto.id] ?? 0,
            }))
            .filter((produto) => produto.quantidade > 0);
    }, [produtos, quantidades]);

    const quantidadeTotal = itensSelecionados.reduce(
        (total, item) => total + item.quantidade,
        0,
    );

    const valorTotal = itensSelecionados.reduce(
        (total, item) =>
            total + item.preco * item.quantidade,
        0,
    );

    function formatarMoeda(valor: number) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(valor);
    }

    async function finalizarVenda() {
        if (itensSelecionados.length === 0) {
            setErro('Selecione pelo menos um produto.');
            return;
        }

        setErro('');
        setSalvando(true);

        try {
            const response = await fetch('/api/vendas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formaPagamento,
                    itens: itensSelecionados.map((item) => ({
                        produtoId: item.id,
                        quantidade: item.quantidade,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(
                    data.erro ?? 'Não foi possível registrar a venda.',
                );
                return;
            }

            window.location.href =
                '/dashboard?venda=sucesso';
        } catch {
            setErro('Não foi possível registrar a venda.');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main className="min-h-screen bg-zinc-100">
            <div className="mx-auto max-w-7xl p-6">
                <Link
                    href="/dashboard"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
                >
                    <ArrowLeft size={18} />
                    Voltar ao dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">
                        Registrar venda
                    </h1>

                    <p className="mt-1 text-zinc-500">
                        Selecione os dindins vendidos
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                    <section>
                        {produtos.length === 0 ? (
                            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                                <ShoppingCart
                                    size={42}
                                    className="mx-auto text-zinc-300"
                                />

                                <h2 className="mt-4 font-semibold text-zinc-900">
                                    Nenhum produto disponível
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Adicione produtos ao estoque antes de registrar uma venda.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {produtos.map((produto) => {
                                    const quantidade =
                                        quantidadeProduto(produto.id);

                                    return (
                                        <div
                                            key={produto.id}
                                            className={`rounded-2xl border bg-white p-5 shadow-sm transition ${quantidade > 0
                                                    ? 'border-pink-300'
                                                    : 'border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h2 className="font-semibold text-zinc-900">
                                                        {produto.nome}
                                                    </h2>

                                                    <p className="mt-1 text-lg font-bold text-pink-600">
                                                        {formatarMoeda(
                                                            produto.preco,
                                                        )}
                                                    </p>
                                                </div>

                                                <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                                                    {produto.estoque} disponíveis
                                                </span>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between rounded-xl bg-zinc-50 p-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        remover(produto)
                                                    }
                                                    disabled={quantidade === 0}
                                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <Minus size={18} />
                                                </button>

                                                <span className="text-xl font-bold text-zinc-900">
                                                    {quantidade}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        adicionar(produto)
                                                    }
                                                    disabled={
                                                        quantidade >= produto.estoque
                                                    }
                                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-600 text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <aside>
                        <div className="rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
                            <h2 className="text-lg font-bold text-zinc-900">
                                Resumo da venda
                            </h2>

                            {itensSelecionados.length === 0 ? (
                                <div className="py-8 text-center">
                                    <ShoppingCart
                                        size={34}
                                        className="mx-auto text-zinc-300"
                                    />

                                    <p className="mt-3 text-sm text-zinc-500">
                                        Nenhum produto selecionado.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    {itensSelecionados.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between gap-4 text-sm"
                                        >
                                            <div>
                                                <p className="font-medium text-zinc-800">
                                                    {item.nome}
                                                </p>

                                                <p className="text-zinc-500">
                                                    {item.quantidade} ×{' '}
                                                    {formatarMoeda(item.preco)}
                                                </p>
                                            </div>

                                            <p className="font-semibold text-zinc-900">
                                                {formatarMoeda(
                                                    item.preco *
                                                    item.quantidade,
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="my-6 border-t border-zinc-200" />

                            <p className="mb-3 text-sm font-semibold text-zinc-700">
                                Forma de pagamento
                            </p>

                            <div className="grid grid-cols-3 gap-2">
                                <PagamentoButton
                                    ativo={formaPagamento === 'PIX'}
                                    label="PIX"
                                    icone={<QrCode size={19} />}
                                    onClick={() =>
                                        setFormaPagamento('PIX')
                                    }
                                />

                                <PagamentoButton
                                    ativo={
                                        formaPagamento === 'DINHEIRO'
                                    }
                                    label="Dinheiro"
                                    icone={<Banknote size={19} />}
                                    onClick={() =>
                                        setFormaPagamento('DINHEIRO')
                                    }
                                />

                                <PagamentoButton
                                    ativo={
                                        formaPagamento === 'CARTAO'
                                    }
                                    label="Cartão"
                                    icone={<CreditCard size={19} />}
                                    onClick={() =>
                                        setFormaPagamento('CARTAO')
                                    }
                                />
                            </div>

                            <div className="my-6 border-t border-zinc-200" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500">
                                        {quantidadeTotal}{' '}
                                        {quantidadeTotal === 1
                                            ? 'unidade'
                                            : 'unidades'}
                                    </p>

                                    <p className="text-sm font-semibold text-zinc-700">
                                        Total
                                    </p>
                                </div>

                                <p className="text-2xl font-bold text-zinc-900">
                                    {formatarMoeda(valorTotal)}
                                </p>
                            </div>

                            {erro && (
                                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {erro}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={finalizarVenda}
                                disabled={
                                    salvando ||
                                    itensSelecionados.length === 0
                                }
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3.5 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Check size={19} />

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
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition ${ativo
                    ? 'border-pink-500 bg-pink-50 text-pink-600'
                    : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
        >
            {icone}
            {label}
        </button>
    );
}