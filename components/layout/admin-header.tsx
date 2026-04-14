'use client';

import { useRouter } from 'next/navigation';

type AdminHeaderProps = {
  userEmail: string;
  userRole: string;
};

export function AdminHeader({ userEmail, userRole }: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">{userEmail}</p>
        <h1 className="text-base font-semibold text-slate-900">{userRole}</h1>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
      >
        Cerrar sesión
      </button>
    </header>
  );
}