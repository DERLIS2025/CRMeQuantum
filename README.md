# eQuantum CRM — Base Técnica Inicial (MVP)

Base inicial del CRM omnicanal de eQuantum con una primera funcionalidad real end-to-end:
**autenticación básica + módulo de contactos con persistencia en PostgreSQL vía Prisma**.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL

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
5. Crear migración inicial:
   ```bash
   npm run prisma:migrate -- --name init
   ```
6. Ejecutar seed inicial:
   ```bash
   npm run prisma:seed
   ```

Seed crea:
- Roles: `ADMIN`, `SUPERVISOR`, `ADVISOR`.
- Pipeline por defecto: **Pipeline Comercial eQuantum**.
- Etapas del pipeline (8).
- Usuario admin demo:
  - email: `admin@equantum.local`
  - password: `Admin1234!`

## 2) Autenticación básica
### Endpoints
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Comportamiento
- Login con email/password (hash bcrypt).
- Sesión simple via cookie HTTP-only firmada.
- Protección de rutas administrativas a través del layout `(admin)`.

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
