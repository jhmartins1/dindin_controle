import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dindin Controle',
  description:
    'Sistema de controle de vendas, estoque e gastos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}