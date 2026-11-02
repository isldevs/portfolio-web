import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/shell';

export const dynamic = 'force-dynamic';
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookie = (await cookies()).toString();
  let user: { username: string; role: string } | undefined;
  let unavailable = false;
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL || 'http://127.0.0.1:8080'}/api/v1/admin/auth/me`,
      { headers: { Cookie: cookie }, cache: 'no-store' },
    );
    if (response.ok) user = await response.json();
    else if (response.status !== 401 && response.status !== 403) unavailable = true;
  } catch {
    unavailable = true;
  }
  if (unavailable)
    return (
      <main className="admin-login">
        <p className="admin-eyebrow">{'// CONNECTION_UNAVAILABLE'}</p>
        <h1>The console is temporarily unavailable.</h1>
        <p>Check that the API is running, then reload this page.</p>
        <form action="/admin">
          <button className="admin-button" type="submit">
            Retry connection
          </button>
        </form>
      </main>
    );
  if (!user) redirect('/admin/login');
  return <AdminShell username={user.username}>{children}</AdminShell>;
}
