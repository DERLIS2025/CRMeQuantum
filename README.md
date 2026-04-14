# eQuantum CRM — Base Técnica SaaS (Multi-tenant)

Base técnica del CRM omnicanal de eQuantum evolucionada a modelo SaaS multi-tenant:

**autenticación + contactos + inbox de conversaciones/mensajes con aislamiento por organización**.

---

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL

---

## Enfoque SaaS multi-tenant
- `Organization` representa cada empresa cliente.
- `Plan` define el plan comercial.
- `Subscription` vincula organización y plan activo.
- Cada sesión incluye `organizationId`.
- Todas las consultas operativas (`contacts`, `conversations`, `messages`, `channels`) filtran por `organizationId`.

---

## Estructura principal
- `app/`: páginas web y endpoints API (`/api/*`).
- `components/`: UI del panel admin, contactos e inbox.
- `lib/`: cliente Prisma, sesión simple y utilidades de auth API.
- `prisma/`: `schema.prisma` + `seed.ts`.
- `services/`: contratos para futuras integraciones (Meta / Tati IA).
- `modules/`: espacio para casos de uso por dominio.
- `types/`: tipos compartidos.

---

## Estado actual
- Layout administrativo con **sidebar + header + dashboard**.
- Autenticación funcional con sesión.
- Módulo de **contactos funcional (CRUD básico)**.
- Módulo de **inbox funcional** para conversaciones y mensajes.
- Base multi-tenant con aislamiento por organización.
- Seed inicial con plan, organización demo, roles, pipeline, canales y usuario admin.
- Base preparada para futuras integraciones (Meta + Tati IA).

---

## 1) Configurar base de datos y Prisma

1. Copiar variables de entorno:

```bash
cp .env.example .env