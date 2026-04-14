# eQuantum CRM — Base Técnica Inicial (MVP)

Base inicial del CRM omnicanal de eQuantum con foco en simplicidad, escalabilidad y evolución iterativa.

Actualmente incluye una primera funcionalidad real end-to-end:
**autenticación básica + módulo de contactos + inbox de conversaciones/mensajes con persistencia en PostgreSQL vía Prisma**.

---

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL

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
- Autenticación básica funcional (login + sesión).
- Módulo de **contactos funcional (CRUD básico)**.
- Módulo de **inbox funcional** para conversaciones y mensajes.
- Prisma configurado con modelos núcleo del CRM.
- Seed inicial con roles, pipeline y usuario admin.
- Base preparada para futuras integraciones (Meta + Tati IA).

---

## 1) Configurar base de datos y Prisma

1. Copiar variables de entorno:
```bash
cp .env.example .env