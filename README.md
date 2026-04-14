# eQuantum CRM — Base Técnica SaaS (Multi-tenant)

Base técnica del CRM omnicanal de eQuantum evolucionada a modelo SaaS multi-tenant:
**autenticación + contactos + inbox de conversaciones/mensajes con aislamiento por organización**.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL

## Enfoque SaaS multi-tenant
- `Organization` representa cada empresa cliente.
- `Plan` define el plan comercial.
- `Subscription` vincula organización y plan activo.
- Cada sesión incluye `organizationId`.
- Todas las consultas operativas (`contacts`, `conversations`, `messages`, `channels`) filtran por `organizationId`.

## Estructura principal
- `app/`: páginas web y endpoints API (`/api/*`).
- `components/`: UI del panel admin y contactos.
- `lib/`: cliente Prisma, sesión simple y utilidades de auth API.
- `prisma/`: `schema.prisma` + `seed.ts`.
- `services/`: contratos para futuras integraciones (Meta / Tati IA).
- `modules/`: espacio para casos de uso por dominio.
- `types/`: tipos compartidos.

## 1) Configurar base de datos y Prisma
1. Copiar variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Definir `DATABASE_URL` real en `.env`.
3. Definir `SESSION_SECRET` en `.env` (ejemplo: `openssl rand -base64 32`).
4. Instalar dependencias:
   ```bash
   npm install
   ```
5. Crear migración (en este cambio hay refactor de schema multi-tenant):
   ```bash
   npm run prisma:migrate -- --name saas_multitenant
   ```
6. Ejecutar seed inicial:
   ```bash
   npm run prisma:seed
   ```

Seed crea:
- Plan base SaaS (`base`).
- Organización demo (`demo-equantum`).
- Suscripción activa de la organización demo al plan base.
- Roles: `ADMIN`, `SUPERVISOR`, `ADVISOR`.
- Pipeline por defecto por organización.
- Canales demo por organización.
- Usuario admin demo ligado a organización:
  - email: `admin@equantum.local`
  - password: `Admin1234!`

## 2) Autenticación básica
### Endpoints
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Comportamiento
- Login con email/password (hash bcrypt).
- Signup SaaS transaccional para alta de nueva organización cliente.
- Sesión simple via cookie HTTP-only firmada.
- Protección de rutas administrativas a través del layout `(admin)`.

### Signup SaaS (`/signup`)
Campos:
- `companyName`
- `companySlug`
- `fullName`
- `email`
- `password`

Lógica en transacción Prisma:
1. Busca plan base (`code = base`).
2. Crea `Organization`.
3. Crea `Subscription` activa.
4. Busca rol `ADMIN`.
5. Crea usuario admin de la organización.
6. Crea pipeline inicial + stages.

## 3) Módulo CONTACTOS funcional
### Endpoints
- `GET /api/contacts`
- `POST /api/contacts`
- `PATCH /api/contacts/:id`

Todos los endpoints usan Prisma y validan sesión.

### Frontend
- Página: `/contacts`
- Incluye:
  - listado de contactos
  - formulario de alta
  - edición básica inline (carga datos al formulario)

## 4) Correr proyecto
```bash
npm run dev
```

Flujo manual sugerido:
1. Abrir `http://localhost:3000/login`.
2. Ingresar con usuario demo.
3. Ir a `http://localhost:3000/contacts`.
4. Crear un contacto y verificar que aparece en listado.
5. Editar contacto y validar actualización.

## 5) Próximos pasos recomendados
- Agregar validación de payload (Zod).
- Agregar filtros/búsqueda en contactos.
- Incorporar paginación en `GET /api/contacts`.
- Extender RBAC por rol (`ADMIN`, `SUPERVISOR`, `ADVISOR`).
- Integrar canales Meta y Tati sobre contratos existentes en `services/`.
- Añadir controles de autorización por rol dentro de la misma organización.

## 6) Módulo Inbox (conversaciones y mensajes)
### Endpoints
- `GET /api/conversations`
- `GET /api/conversations/:id`
- `POST /api/conversations`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`

### UI
- Página `/inbox` con 3 columnas:
  - izquierda: lista de conversaciones + formulario de creación manual
  - centro: chat activo y envío manual de mensajes
  - derecha: ficha rápida del contacto

### Flujo mínimo
1. Crear (o tener) un contacto en `/contacts`.
2. Ir a `/inbox`.
3. Crear conversación manual (contacto + canal).
4. Seleccionar conversación en la lista izquierda.
5. Enviar mensaje en el panel central.
6. Ver actualización de mensajes y preview en la conversación.
