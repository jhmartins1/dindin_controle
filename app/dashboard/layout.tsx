import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type {
    ReactNode,
} from 'react';

import { DashboardNav } from './DashboardNav';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const cookieStore =
        await cookies();

    const session =
        cookieStore.get(
            'dindin_session',
        );

    const sessionToken =
        process.env.SESSION_TOKEN;

    if (!sessionToken) {
        throw new Error(
            'SESSION_TOKEN não configurado.',
        );
    }

    if (
        !session ||
        session.value !== sessionToken
    ) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-pink-50/40">
            <DashboardNav />

            {children}
        </div>
    );
}