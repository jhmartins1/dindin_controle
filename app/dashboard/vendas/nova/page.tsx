import { prisma } from '../../../../src/lib/prisma';
import { RegistrarVenda } from './RegistrarVenda';

export default async function NovaVendaPage() {
    const produtosBanco = await prisma.produto.findMany({
        where: {
            ativo: true,
            estoque: {
                gt: 0,
            },
        },
        orderBy: {
            nome: 'asc',
        },
    });

    const produtos = produtosBanco.map((produto) => ({
        id: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco),
        estoque: produto.estoque,
    }));

    return <RegistrarVenda produtos={produtos} />;
}