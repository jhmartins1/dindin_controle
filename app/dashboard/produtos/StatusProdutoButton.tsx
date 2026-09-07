'use client';

import {
    Eye,
    EyeOff,
} from 'lucide-react';

import {
    useRouter,
} from 'next/navigation';

import {
    useState,
} from 'react';

interface StatusProdutoButtonProps {
    produtoId: number;
    produtoNome: string;
    ativo: boolean;
}

export function StatusProdutoButton({
    produtoId,
    produtoNome,
    ativo,
}: StatusProdutoButtonProps) {
    const router = useRouter();

    const [salvando, setSalvando] =
        useState(false);

    const [erro, setErro] =
        useState('');

    async function alterarStatus() {
        const mensagem = ativo
            ? `Deseja desativar "${produtoNome}"? Ele não aparecerá mais nas vendas.`
            : `Deseja reativar "${produtoNome}"?`;

        const confirmou =
            window.confirm(mensagem);

        if (!confirmou) {
            return;
        }

        try {
            setErro('');
            setSalvando(true);

            const response = await fetch(
                `/api/produtos/${produtoId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify({
                        ativo: !ativo,
                    }),
                },
            );

            const data =
                await response.json();

            if (!response.ok) {
                setErro(
                    data.erro ??
                    'Não foi possível alterar o produto.',
                );

                return;
            }

            router.refresh();
        } catch {
            setErro(
                'Não foi possível alterar o produto.',
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={alterarStatus}
                disabled={salvando}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${ativo
                        ? 'border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                        : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
            >
                {ativo ? (
                    <>
                        <EyeOff
                            size={17}
                        />

                        {salvando
                            ? 'Desativando...'
                            : 'Desativar'}
                    </>
                ) : (
                    <>
                        <Eye
                            size={17}
                        />

                        {salvando
                            ? 'Reativando...'
                            : 'Reativar'}
                    </>
                )}
            </button>

            {erro && (
                <p className="mt-2 text-sm text-red-600">
                    {erro}
                </p>
            )}
        </div>
    );
}