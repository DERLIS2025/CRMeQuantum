# eQuantum CRM — Base Técnica Inicial (MVP)

Base inicial del proyecto para construir el CRM omnicanal de eQuantum con foco en simplicidad, escalabilidad y evolución iterativa.

## Stack definido
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM**
- **PostgreSQL**

## Estructura base
- `app/`: rutas y layout base administrativo.
- `components/`: componentes visuales reutilizables.
- `lib/`: utilidades de infraestructura (ej. cliente Prisma).
- `prisma/`: esquema de datos y migraciones.
- `types/`: tipos compartidos de dominio.
- `services/`: puertos/contratos para integraciones externas.
- `modules/`: módulos de negocio (auth, contactos, conversaciones, etc.).

## Estado actual
- Layout administrativo inicial con **sidebar + header + dashboard vacío**.
- `prisma/schema.prisma` creado con los modelos núcleo del plan maestro.
- Enums iniciales para estados y tipologías del dominio.
- Contratos listos para futuras integraciones de canales y Tati IA.

## Comandos recomendados
```bash
npm install
npm run prisma:generate
npm run dev
```

## Próximos pasos sugeridos
1. Crear migración inicial (`prisma migrate dev`).
2. Sembrar roles base (`ADMIN`, `SUPERVISOR`, `ADVISOR`).
3. Implementar autenticación (NextAuth o JWT + sesiones).
4. Construir APIs CRUD para contactos, conversaciones y tareas.
5. Añadir capa de eventos/webhooks para canales (Meta) en siguiente sprint.
6. Integrar proveedor de IA para Tati sobre los contratos de `services/`.
