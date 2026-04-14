'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Contact = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  status: string;
};

type ContactForm = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  status: string;
};

const initialForm: ContactForm = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  status: 'NEW',
};

export function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  async function loadContacts() {
    setLoading(true);
    const response = await fetch('/api/contacts');

    if (response.ok) {
      const data = (await response.json()) as Contact[];
      setContacts(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadContacts();
  }, []);

  function fillFormForEdit(contact: Contact) {
    setEditingId(contact.id);
    setForm({
      fullName: contact.fullName,
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      city: contact.city ?? '',
      status: contact.status,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const payload = {
      fullName: form.fullName,
      email: form.email || null,
      phone: form.phone || null,
      city: form.city || null,
      status: form.status,
    };

    const endpoint = editingId ? `/api/contacts/${editingId}` : '/api/contacts';
    const method = editingId ? 'PATCH' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setMessage(data.error ?? 'No se pudo guardar el contacto.');
      return;
    }

    setMessage(editingId ? 'Contacto actualizado.' : 'Contacto creado.');
    resetForm();
    await loadContacts();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Contactos</h1>
        <p className="mt-2 text-sm text-slate-600">Alta y edición básica de contactos para el MVP.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Editar contacto' : 'Nuevo contacto'}</h2>

          <div className="mt-4 space-y-3">
            <input
              placeholder="Nombre completo"
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Teléfono"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Ciudad"
              value={form.city}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="PROPOSAL">PROPOSAL</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
              {isEditing ? 'Guardar cambios' : 'Crear contacto'}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
              >
                Cancelar
              </button>
            ) : null}
          </div>

          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Listado</h2>

          {loading ? <p className="mt-4 text-sm text-slate-500">Cargando contactos...</p> : null}

          {!loading && contacts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No hay contactos aún.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {contacts.map((contact) => (
                <li key={contact.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{contact.fullName}</p>
                      <p className="text-sm text-slate-600">{contact.email ?? 'Sin email'} · {contact.phone ?? 'Sin teléfono'}</p>
                      <p className="text-xs text-slate-500">{contact.city ?? 'Sin ciudad'} · {contact.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillFormForEdit(contact)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700"
                    >
                      Editar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
