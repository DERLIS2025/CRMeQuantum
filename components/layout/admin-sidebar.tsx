import Link from 'next/link';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Contactos', href: '/contacts' },
];

export function AdminSidebar() {
  return (
    <aside className="border-r border-slate-200 bg-white p-4 lg:p-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">eQuantum CRM</p>
        <h2 className="text-xl font-bold text-slate-900">Panel Admin</h2>
      </div>

      <nav aria-label="Navegación principal">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
