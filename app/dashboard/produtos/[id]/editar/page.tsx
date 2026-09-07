'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    FormEvent,
    useEffect,
    useState,
} from 'react';

export default function EditarProdutoPage() {
    const params = useParams();
    const id = params.id as string;

    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [estoque, setEstoque] = useState('');

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        async function buscarProduto() {
            try {
                setErro('');

                const response = await fetch(`/api/produtos/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    setErro(data.erro ?? 'Produto não encontrado.');
                    return;
                }

                setNome(data.produto.nome);
                setPreco(String(data.produto.preco));
                setEstoque(String(data.produto.estoque));
            } catch {
                setErro('Não foi possível carregar o produto.');
            } finally {
                setCarregando(false);
            }
        }

        if (id) {
            buscarProduto();
        }
    }, [id]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setErro('');
        setSalvando(true);

        try {
            const response = await fetch(`/api/produtos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome,
                    preco,
                    estoque,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.erro ?? 'Erro ao atualizar produto.');
                return;
            }

            window.location.href = '/dashboard/produtos';
        } catch {
            setErro('Não foi possível atualizar o produto.');
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <main className="min-h-screen bg-zinc-100">
                <div className="mx-auto max-w-2xl p-6">
                    <p className="text-zinc-500">
                        Carregando produto...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-100">
            <div className="mx-auto max-w-2xl p-6">
                <Link
                    href="/dashboard/produtos"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </Link>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Editar produto
                        </h1>

                        <p className="mt-1 text-zinc-500">
                            Altere os dados do sabor
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="nome"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Nome
                            </label>

                            <input
                                id="nome"
                                value={nome}
                                onChange={(event) =>
                                    setNome(event.target.value)
                                }
                                required
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="preco"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Preço
                            </label>

                            <input
                                id="preco"
                                type="number"
                                step="0.01"
                                min="0"
                                value={preco}
                                onChange={(event) =>
                                    setPreco(event.target.value)
                                }
                                required
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="estoque"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Estoque
                            </label>

                            <input
                                id="estoque"
                                type="number"
                                min="0"
                                value={estoque}
                                onChange={(event) =>
                                    setEstoque(event.target.value)
                                }
                                required
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                            />
                        </div>

                        {erro && (
                            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                {erro}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={salvando}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={18} />

                            {salvando
                                ? 'Salvando...'
                                : 'Salvar alterações'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}