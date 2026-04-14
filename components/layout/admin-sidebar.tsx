import Link from 'next/link';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Bandeja', href: '/inbox' },
  { label: 'Contactos', href: '/contacts' },
  { label: 'Oportunidades', href: '/deals' },
  { label: 'Tareas', href: '/tasks' },
  { label: 'Automatizaciones', href: '/automations' },
  { label: 'Tati IA', href: '/ai' },
  { label: 'Configuración', href: '/settings' },
];

export function AdminSidebar() {
  return (
    <aside className="border-r border-slate-200 bg-white p-4 lg:p-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          eQuantum CRM
        </p>
        <h2 className="text-xl font-bold text-slate-900">Panel Admin</h2>
      </div>

      <nav aria-label="Navegación principal">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  index === 0
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
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