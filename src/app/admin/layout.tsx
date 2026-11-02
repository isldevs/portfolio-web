import type { Metadata } from 'next';
import AdminProviders from '@/components/admin/providers';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin console · Yi Sivlay',
  robots: { index: false, follow: false },
};
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <div className="admin-root">{children}</div>
    </AdminProviders>
  );
}
