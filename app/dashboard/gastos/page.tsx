import {
    Car,
    CircleDollarSign,
    PackageOpen,
    ReceiptText,
    ShoppingBasket,
    WalletCards,
} from 'lucide-react';

import type {
    ReactNode,
} from 'react';

import { prisma } from '../../../src/lib/prisma';

import { EditarGastoButton } from './EditarGastoButton';
import { GastoForm } from './GastoForm';

function formatarMoeda(valor: number) {
    return new Intl.NumberFormat(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL',
        },
    ).format(valor);
}

function formatarData(data: Date) {
    return new Intl.DateTimeFormat(
        'pt-BR',
        {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone:
                'America/Sao_Paulo',
        },
    ).format(data);
}

function formatarCategoria(
    categoria: string,
) {
    switch (categoria) {
        case 'INGREDIENTES':
            return 'Ingredientes';

        case 'EMBALAGENS':
            return 'Embalagens';

        case 'TRANSPORTE':
            return 'Transporte';

        case 'OUTROS':
            return 'Outros';

        default:
            return categoria;
    }
}

function estiloCategoria(
    categoria: string,
) {
    switch (categoria) {
        case 'INGREDIENTES':
            return 'bg-pink-50 text-pink-700';

        case 'EMBALAGENS':
            return 'bg-sky-50 text-sky-700';

        case 'TRANSPORTE':
            return 'bg-amber-50 text-amber-700';

        default:
            return 'bg-zinc-100 text-zinc-600';
    }
}

export default async function GastosPage() {
    const gastos =
        await prisma.gasto.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: 100,
        });

    const totalGastos =
        gastos.reduce(
            (total, gasto) =>
                total +
                Number(gasto.valor),
            0,
        );

    const ingredientes =
        gastos
            .filter(
                (gasto) =>
                    gasto.categoria ===
                    'INGREDIENTES',
            )
            .reduce(
                (total, gasto) =>
                    total +
                    Number(
                        gasto.valor,
                    ),
                0,
            );

    const embalagens =
        gastos
            .filter(
                (gasto) =>
                    gasto.categoria ===
                    'EMBALAGENS',
            )
            .reduce(
                (total, gasto) =>
                    total +
                    Number(
                        gasto.valor,
                    ),
                0,
            );

    const transporte =
        gastos
            .filter(
                (gasto) =>
                    gasto.categoria ===
                    'TRANSPORTE',
            )
            .reduce(
                (total, gasto) =>
                    total +
                    Number(
                        gasto.valor,
                    ),
                0,
            );

    const outros =
        gastos
            .filter(
                (gasto) =>
                    gasto.categoria ===
                    'OUTROS',
            )
            .reduce(
                (total, gasto) =>
                    total +
                    Number(
                        gasto.valor,
                    ),
                0,
            );

    return (
        <main className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-pink-600">
                            Financeiro
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                            Gastos
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                            Registre e acompanhe
                            todas as despesas da
                            loja.
                        </p>
                    </div>

                    <GastoForm />
                </div>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <CardResumo
                        titulo="Total de gastos"
                        valor={formatarMoeda(
                            totalGastos,
                        )}
                        descricao="Valor acumulado"
                        icone={
                            <WalletCards
                                size={22}
                            />
                        }
                        destaque="vermelho"
                    />

                    <CardResumo
                        titulo="Registros"
                        valor={`${gastos.length}`}
                        descricao="Despesas cadastradas"
                        icone={
                            <ReceiptText
                                size={22}
                            />
                        }
                        destaque="rosa"
                    />

                    <CardResumo
                        titulo="Média por gasto"
                        valor={formatarMoeda(
                            gastos.length > 0
                                ? totalGastos /
                                gastos.length
                                : 0,
                        )}
                        descricao="Valor médio registrado"
                        icone={
                            <CircleDollarSign
                                size={22}
                            />
                        }
                        destaque="azul"
                    />
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <CategoriaCard
                        titulo="Ingredientes"
                        valor={
                            ingredientes
                        }
                        icone={
                            <ShoppingBasket
                                size={20}
                            />
                        }
                        estilo="rosa"
                    />

                    <CategoriaCard
                        titulo="Embalagens"
                        valor={
                            embalagens
                        }
                        icone={
                            <PackageOpen
                                size={20}
                            />
                        }
                        estilo="azul"
                    />

                    <CategoriaCard
                        titulo="Transporte"
                        valor={
                            transporte
                        }
                        icone={
                            <Car
                                size={20}
                            />
                        }
                        estilo="amarelo"
                    />

                    <CategoriaCard
                        titulo="Outros"
                        valor={outros}
                        icone={
                            <ReceiptText
                                size={20}
                            />
                        }
                        estilo="cinza"
                    />
                </section>

                <section className="mt-8">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900">
                                Histórico de gastos
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Últimos registros
                                cadastrados
                            </p>
                        </div>

                        <span className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-bold text-zinc-600 shadow-sm">
                            {gastos.length}
                        </span>
                    </div>

                    {gastos.length === 0 ? (
                        <div className="rounded-3xl border border-zinc-200/70 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-300">
                                <ReceiptText
                                    size={30}
                                />
                            </div>

                            <h2 className="mt-4 font-bold text-zinc-900">
                                Nenhum gasto
                                registrado
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Cadastre uma
                                despesa para
                                começar.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-zinc-200/70 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50/80 text-left">
                                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-zinc-400">
                                                Descrição
                                            </th>

                                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-zinc-400">
                                                Categoria
                                            </th>

                                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-zinc-400">
                                                Data
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-zinc-400">
                                                Valor
                                            </th>

                                            <th className="w-20 px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-zinc-400">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {gastos.map(
                                            (
                                                gasto,
                                            ) => (
                                                <tr
                                                    key={
                                                        gasto.id
                                                    }
                                                    className="border-b border-zinc-100 transition last:border-b-0 hover:bg-zinc-50/70"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-zinc-900">
                                                            {
                                                                gasto.descricao
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${estiloCategoria(
                                                                gasto.categoria,
                                                            )}`}
                                                        >
                                                            {formatarCategoria(
                                                                gasto.categoria,
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-500">
                                                        {formatarData(
                                                            gasto.createdAt,
                                                        )}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-zinc-900">
                                                        {formatarMoeda(
                                                            Number(
                                                                gasto.valor,
                                                            ),
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <EditarGastoButton
                                                            gasto={{
                                                                id:
                                                                    gasto.id,
                                                                descricao:
                                                                    gasto.descricao,
                                                                valor:
                                                                    Number(
                                                                        gasto.valor,
                                                                    ),
                                                                categoria:
                                                                    gasto.categoria,
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

type Destaque =
    | 'rosa'
    | 'vermelho'
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
        rosa: {
            detalhe:
                'bg-pink-500',
            icone:
                'bg-pink-50 text-pink-600',
        },

        vermelho: {
            detalhe:
                'bg-red-500',
            icone:
                'bg-red-50 text-red-500',
        },

        azul: {
            detalhe:
                'bg-sky-500',
            icone:
                'bg-sky-50 text-sky-600',
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

                    <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
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

type EstiloCategoria =
    | 'rosa'
    | 'azul'
    | 'amarelo'
    | 'cinza';

interface CategoriaCardProps {
    titulo: string;
    valor: number;
    icone: ReactNode;
    estilo: EstiloCategoria;
}

function CategoriaCard({
    titulo,
    valor,
    icone,
    estilo,
}: CategoriaCardProps) {
    const estilos = {
        rosa:
            'bg-pink-50 text-pink-600',

        azul:
            'bg-sky-50 text-sky-600',

        amarelo:
            'bg-amber-50 text-amber-600',

        cinza:
            'bg-zinc-100 text-zinc-500',
    };

    return (
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${estilos[estilo]}`}
                >
                    {icone}
                </div>

                <div>
                    <p className="text-xs font-medium text-zinc-400">
                        {titulo}
                    </p>

                    <p className="mt-0.5 font-bold text-zinc-900">
                        {formatarMoeda(
                            valor,
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}