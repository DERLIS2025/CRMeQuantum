export function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">Bienvenido/a</p>
        <h1 className="text-base font-semibold text-slate-900">Administrador</h1>
      </div>

      <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">MVP</div>
    </header>
  );
}
