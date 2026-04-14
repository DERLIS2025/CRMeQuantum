import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { getServerSession } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <AdminSidebar />
        <div className="flex min-h-screen flex-col">
          <AdminHeader userEmail={session.email} userRole={session.role} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
