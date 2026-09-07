# 🍦 Dindin Gourmet --- Sistema de Controle

Sistema web simples para gerenciamento de uma loja de **dindins
gourmet**, desenvolvido para facilitar o controle diário de **vendas,
produtos, estoque, gastos e resultados**.

O projeto foi pensado para ser direto, rápido e fácil de usar tanto no
computador quanto no celular.

## ✨ Funcionalidades

-   🔐 Login para acesso ao sistema
-   📊 Dashboard com resumo do negócio
-   🍦 Cadastro e edição de produtos
-   📦 Controle de estoque
-   ⚠️ Avisos de estoque baixo
-   🛒 Registro de vendas
-   💳 Pagamentos via PIX, dinheiro ou cartão
-   🚫 Cancelamento de vendas com devolução automática ao estoque
-   💸 Cadastro, edição e exclusão de gastos
-   🧾 Organização dos gastos por categoria
-   📈 Relatórios por período
-   🏆 Ranking de produtos mais vendidos
-   💰 Ranking de produtos com maior faturamento
-   📱 Interface responsiva para desktop e celular

## 📊 Dashboard

O dashboard apresenta uma visão rápida da situação da loja, incluindo
indicadores de faturamento, gastos, resultado, quantidade vendida e
estoque, além de informações sobre produtos com estoque baixo e vendas
recentes.

## 🍦 Produtos e estoque

O sistema permite cadastrar produtos com nome, preço e quantidade
disponível.

Também é possível:

-   adicionar novas unidades ao estoque;
-   editar produtos;
-   desativar produtos sem apagar o histórico;
-   reativar produtos;
-   identificar produtos com estoque baixo ou zerado.

Produtos desativados deixam de aparecer no registro de novas vendas.

## 🛒 Vendas

Na tela de nova venda, os produtos disponíveis podem ser selecionados e
suas quantidades ajustadas.

As formas de pagamento disponíveis são:

-   PIX
-   Dinheiro
-   Cartão

Ao finalizar uma venda, o estoque dos produtos vendidos é atualizado
automaticamente.

Uma venda também pode ser cancelada. Nesse caso, ela permanece
registrada no histórico como cancelada e os produtos são devolvidos ao
estoque.

## 💸 Gastos

As despesas da loja podem ser registradas nas categorias:

-   Ingredientes
-   Embalagens
-   Transporte
-   Outros

Os gastos podem ser editados ou excluídos e são utilizados nos cálculos
financeiros do sistema.

## 📈 Relatórios

A área de relatórios permite analisar períodos de:

-   7 dias
-   30 dias
-   90 dias
-   1 ano

Entre os indicadores disponíveis estão:

-   faturamento;
-   gastos;
-   resultado;
-   quantidade de vendas;
-   unidades vendidas;
-   ticket médio;
-   produtos mais vendidos;
-   produtos com maior faturamento.

## 🛠️ Tecnologias

O projeto utiliza:

-   **Next.js**
-   **React**
-   **TypeScript**
-   **Tailwind CSS**
-   **Prisma ORM**
-   **PostgreSQL**
-   **Supabase**
-   **Lucide React**

## 🗄️ Banco de dados

O banco de dados é PostgreSQL e utiliza Prisma ORM para acesso aos
dados.

As principais entidades do sistema são:

-   `Usuario`
-   `Produto`
-   `Venda`
-   `ItemVenda`
-   `Gasto`

## 🔐 Autenticação

O sistema possui autenticação simples destinada ao uso interno da loja.

As páginas administrativas e as rotas da API são protegidas por sessão.

> Este projeto foi desenvolvido como um sistema interno e não como uma
> plataforma pública ou multiusuário.

## 🚀 Executando o projeto

### 1. Clone o repositório

``` bash
git clone <URL_DO_REPOSITORIO>
cd dindin-controle
```

### 2. Instale as dependências

``` bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

``` env
DATABASE_URL="sua_url_do_postgresql"
SESSION_TOKEN="uma_chave_secreta_segura"
```

> Nunca envie seu arquivo `.env` ou suas credenciais para o GitHub.

### 4. Gere o Prisma Client

``` bash
npx prisma generate
```

### 5. Execute as migrations

Para desenvolvimento:

``` bash
npx prisma migrate dev
```

Para um ambiente de produção com migrations já criadas:

``` bash
npx prisma migrate deploy
```

### 6. Inicie o projeto

``` bash
npm run dev
```

Depois, acesse o endereço informado pelo Next.js no terminal.

## 📁 Estrutura principal

``` text
dindin-controle/
├── app/
│   ├── api/
│   ├── dashboard/
│   │   ├── gastos/
│   │   ├── produtos/
│   │   ├── relatorios/
│   │   └── vendas/
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── prisma/
│   └── schema.prisma
├── src/
│   ├── generated/
│   └── lib/
└── package.json
```

## 🔒 Segurança

Antes de publicar uma nova versão do sistema:

-   não exponha `DATABASE_URL`;
-   não exponha `SESSION_TOKEN`;
-   mantenha o arquivo `.env` no `.gitignore`;
-   utilize credenciais diferentes entre desenvolvimento e produção;
-   utilize uma `SESSION_TOKEN` longa e aleatória.

## 🎯 Objetivo

O Dindin Gourmet foi criado para substituir controles manuais por uma
solução simples e centralizada, permitindo acompanhar as operações
essenciais da loja sem adicionar complexidade desnecessária.

## 👨‍💻 Desenvolvedor

Desenvolvido por **0xJHM**.

Instagram: [@jh.martins1](https://www.instagram.com/jh.martins1/)

------------------------------------------------------------------------

```{=html}
<p align="center">
```
Feito com 💗 para facilitar o controle do Dindin Gourmet.
```{=html}
</p>
```
