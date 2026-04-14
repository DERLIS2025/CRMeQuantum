const menuItems = [
  'Dashboard',
  'Bandeja',
  'Contactos',
  'Oportunidades',
  'Tareas',
  'Automatizaciones',
  'Tati IA',
  'Configuración',
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
          {menuItems.map((item, index) => (
            <li key={item}>
              <button
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  index === 0
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
