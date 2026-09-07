import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();

  const session =
    cookieStore.get('dindin_session');

  const sessionToken =
    process.env.SESSION_TOKEN;

  if (
    sessionToken &&
    session?.value === sessionToken
  ) {
    redirect('/dashboard');
  }

  redirect('/login');
}