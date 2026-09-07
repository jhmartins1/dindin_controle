import {
    ReceiptText,
} from 'lucide-react';

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

    return (
        <main className="min-h-screen bg-zinc-100">
            <div className="mx-auto max-w-7xl p-6">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Gastos
                        </h1>

                        <p className="mt-1 text-zinc-500">
                            Controle das despesas da loja
                        </p>
                    </div>

                    <GastoForm />
                </div>

                <section className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-zinc-500">
                            Gastos registrados
                        </p>

                        <p className="mt-2 text-2xl font-bold text-zinc-900">
                            {gastos.length}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-zinc-500">
                            Total de gastos
                        </p>

                        <p className="mt-2 text-2xl font-bold text-zinc-900">
                            {formatarMoeda(
                                totalGastos,
                            )}
                        </p>
                    </div>
                </section>

                {gastos.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <ReceiptText
                            size={42}
                            className="mx-auto text-zinc-300"
                        />

                        <h2 className="mt-4 font-semibold text-zinc-900">
                            Nenhum gasto registrado
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Cadastre uma despesa para começar.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                                        <th className="px-5 py-4 text-sm font-semibold text-zinc-600">
                                            Descrição
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-zinc-600">
                                            Categoria
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-zinc-600">
                                            Data
                                        </th>

                                        <th className="px-5 py-4 text-right text-sm font-semibold text-zinc-600">
                                            Valor
                                        </th>

                                        <th className="w-16 px-5 py-4 text-right text-sm font-semibold text-zinc-600">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {gastos.map(
                                        (gasto) => (
                                            <tr
                                                key={
                                                    gasto.id
                                                }
                                                className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-zinc-900">
                                                        {
                                                            gasto.descricao
                                                        }
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-600">
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
            </div>
        </main>
    );
}