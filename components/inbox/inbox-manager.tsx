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

type Channel = {
  id: string;
  name: string;
  type: string;
};

type Conversation = {
  id: string;
  subject: string | null;
  status: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  contact: Contact;
  channel: Channel;
};

type Message = {
  id: string;
  textBody: string | null;
  direction: string;
  senderType: string;
  createdAt: string;
};

export function InboxManager() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newConversation, setNewConversation] = useState({ contactId: '', channelId: '', subject: '' });
  const [status, setStatus] = useState<string | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  async function loadBaseData() {
    const [conversationsResponse, contactsResponse, channelsResponse] = await Promise.all([
      fetch('/api/conversations'),
      fetch('/api/contacts'),
      fetch('/api/channels'),
    ]);

    if (conversationsResponse.ok) {
      const data = (await conversationsResponse.json()) as Conversation[];
      setConversations(data);

      if (!selectedConversationId && data.length > 0) {
        setSelectedConversationId(data[0].id);
      }
    }

    if (contactsResponse.ok) {
      const data = (await contactsResponse.json()) as Contact[];
      setContacts(data);
    }

    if (channelsResponse.ok) {
      const data = (await channelsResponse.json()) as Channel[];
      setChannels(data);
    }
  }

  async function loadMessages(conversationId: string) {
    const response = await fetch(`/api/conversations/${conversationId}/messages`);

    if (response.ok) {
      const data = (await response.json()) as Message[];
      setMessages(data);
    }
  }

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    loadMessages(selectedConversationId);
  }, [selectedConversationId]);

  async function handleCreateConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactId: newConversation.contactId,
        channelId: newConversation.channelId,
        subject: newConversation.subject || undefined,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setStatus(data.error ?? 'No se pudo crear la conversación.');
      return;
    }

    const createdConversation = (await response.json()) as Conversation;
    setStatus('Conversación creada.');
    setNewConversation({ contactId: '', channelId: '', subject: '' });
    await loadBaseData();
    setSelectedConversationId(createdConversation.id);
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConversationId || !newMessage.trim()) {
      return;
    }

    const response = await fetch(`/api/conversations/${selectedConversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textBody: newMessage }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setStatus(data.error ?? 'No se pudo enviar el mensaje.');
      return;
    }

    setNewMessage('');
    await Promise.all([loadMessages(selectedConversationId), loadBaseData()]);
  }

  return (
    <section className="grid min-h-[75vh] gap-4 lg:grid-cols-[320px_1fr_320px]">
      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Conversaciones</h2>

        <form onSubmit={handleCreateConversation} className="mt-3 space-y-2 rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-medium uppercase text-slate-500">Nueva conversación</p>
          <select
            value={newConversation.contactId}
            onChange={(event) => setNewConversation((prev) => ({ ...prev, contactId: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            required
          >
            <option value="">Seleccionar contacto</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.fullName}
              </option>
            ))}
          </select>

          <select
            value={newConversation.channelId}
            onChange={(event) => setNewConversation((prev) => ({ ...prev, channelId: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            required
          >
            <option value="">Seleccionar canal</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Asunto (opcional)"
            value={newConversation.subject}
            onChange={(event) => setNewConversation((prev) => ({ ...prev, subject: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          />

          <button type="submit" className="w-full rounded-md bg-slate-900 px-2 py-1.5 text-sm text-white">
            Crear
          </button>
        </form>

        <ul className="mt-4 space-y-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`w-full rounded-lg border p-3 text-left ${
                  selectedConversationId === conversation.id ? 'border-slate-900 bg-slate-100' : 'border-slate-200'
                }`}
              >
                <p className="text-sm font-medium text-slate-900">{conversation.contact.fullName}</p>
                <p className="text-xs text-slate-500">{conversation.channel.name}</p>
                <p className="mt-1 truncate text-xs text-slate-600">{conversation.lastMessagePreview ?? 'Sin mensajes aún'}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Chat</h2>
        {!selectedConversation ? (
          <p className="mt-3 text-sm text-slate-500">Seleccioná una conversación.</p>
        ) : (
          <>
            <div className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-md bg-slate-50 p-3">
              {messages.length === 0 ? <p className="text-sm text-slate-500">Aún no hay mensajes.</p> : null}
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      message.direction === 'OUTBOUND' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                    }`}
                  >
                    <p>{message.textBody}</p>
                    <p className="mt-1 text-[10px] opacity-70">{new Date(message.createdAt).toLocaleString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
              <input
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Escribí un mensaje..."
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
                Enviar
              </button>
            </form>
          </>
        )}
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Contacto</h2>

        {!selectedConversation ? (
          <p className="mt-3 text-sm text-slate-500">Sin conversación seleccionada.</p>
        ) : (
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="font-medium">Nombre:</span> {selectedConversation.contact.fullName}
            </p>
            <p>
              <span className="font-medium">Email:</span> {selectedConversation.contact.email ?? 'N/A'}
            </p>
            <p>
              <span className="font-medium">Teléfono:</span> {selectedConversation.contact.phone ?? 'N/A'}
            </p>
            <p>
              <span className="font-medium">Ciudad:</span> {selectedConversation.contact.city ?? 'N/A'}
            </p>
            <p>
              <span className="font-medium">Estado lead:</span> {selectedConversation.contact.status}
            </p>
            <p>
              <span className="font-medium">Canal:</span> {selectedConversation.channel.name}
            </p>
          </div>
        )}

        {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
      </aside>
    </section>
  );
}
