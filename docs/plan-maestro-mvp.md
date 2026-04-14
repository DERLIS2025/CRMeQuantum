# eQuantum CRM — Plan Maestro MVP

## Visión
Crear un CRM propio para eQuantum que centralice conversaciones, contactos, seguimiento comercial y automatizaciones básicas en una sola plataforma.

## Objetivo principal
Unificar en un solo sistema los mensajes de WhatsApp, Instagram y Facebook Messenger para:

- responder desde una bandeja única
- registrar automáticamente leads y clientes
- organizar oportunidades de venta
- asignar responsables
- automatizar tareas y respuestas básicas
- incorporar una asistente IA llamada **Tati**

## Problema que resuelve
La dispersión de conversaciones entre múltiples apps provoca:

- pérdida de leads
- falta de seguimiento
- duplicación de contactos
- dificultad para medir resultados
- desorden operativo

## Propuesta de valor
**Una plataforma omnicanal de atención y ventas con inteligencia comercial integrada.**

---

## Alcance del MVP (v1)

### 1) Autenticación y usuarios
Roles iniciales:
- Admin
- Asesor
- Supervisor

Funciones:
- login seguro
- control de acceso por rol
- vistas por perfil

### 2) Bandeja unificada
Canales:
- WhatsApp
- Instagram
- Facebook Messenger

Funciones:
- listado de conversaciones
- filtros por canal y estado
- búsqueda por nombre, teléfono o usuario
- apertura y respuesta de conversación desde CRM
- historial completo

### 3) Contactos / Leads
Datos de contacto:
- nombre
- teléfono
- Instagram user
- Facebook user
- empresa
- rubro
- ciudad
- canal de origen
- estado del lead
- servicio de interés
- asesor asignado
- etiquetas

### 4) Pipeline comercial
Etapas sugeridas:
- Nuevo lead
- Contactado
- Calificado
- Reunión agendada
- Propuesta enviada
- Negociación
- Ganado
- Perdido

Funciones:
- mover leads entre etapas
- vista por columnas
- valor estimado
- fecha esperada de cierre

### 5) Notas y tareas
- notas internas privadas
- tareas por contacto
- recordatorios de seguimiento
- vencimiento y responsable

### 6) Dashboard básico
Indicadores:
- leads por canal
- conversaciones activas
- tiempo promedio de respuesta
- leads por asesor
- negocios ganados/perdidos
- embudo básico de conversión

### 7) Tati IA (v1)
- mensaje de bienvenida
- clasificación de lead
- FAQs
- resumen automático de conversación
- sugerencia de próxima acción

---

## Flujos funcionales principales

### Flujo 1: Entrada de mensaje
1. Llega mensaje desde WhatsApp / Instagram / Facebook.
2. Webhook recibe evento.
3. Se identifica si contacto existe.
4. Si no existe: se crea lead.
5. Se crea/actualiza conversación.
6. Se muestra en bandeja.
7. Se permite intervención humana o automatizada.

### Flujo 2: Seguimiento comercial
1. Asesor responde.
2. Agrega nota interna.
3. Crea tarea de seguimiento.
4. Mueve lead en pipeline.
5. Registra resultado.

### Flujo 3: Asistencia de Tati
1. Lead entra por canal.
2. Tati saluda.
3. Consulta necesidad.
4. Clasifica interés.
5. Deja resumen.
6. Deriva a asesor.

---

## Mapa de pantallas
1. **Login**: email, contraseña, recuperación.
2. **Dashboard**: métricas, accesos rápidos, conversaciones recientes, tareas vencidas.
3. **Bandeja (3 columnas)**: lista conversaciones, chat activo, ficha cliente.
4. **Contactos**: listado, filtros, búsqueda, perfil.
5. **Oportunidades**: kanban pipeline, montos, estado, fecha estimada.
6. **Tareas**: pendientes, vencidas, por responsable.
7. **Automatizaciones**: bienvenida, respuestas rápidas, derivación.
8. **Tati IA**: tono, prompts de clasificación, FAQs, sugerencias.
9. **Configuración**: usuarios, canales, plantillas, etiquetas, pipelines.

---

## Arquitectura funcional

### 1) Capa de canales
Responsable de recepción y envío con plataformas externas:
- WhatsApp Business Platform
- Instagram Messaging
- Facebook Messenger

Responsabilidades:
- recibir webhooks
- validar firma
- normalizar eventos
- transformar mensajes al formato interno
- enviar respuestas al canal correcto

### 2) Capa de orquestación
- identificar canal, conversación y contacto
- asignar asesor
- disparar automatizaciones
- registrar actividad
- invocar Tati

### 3) Capa CRM
- contactos
- conversaciones
- pipeline
- tareas y notas
- dashboard
- permisos por rol

### 4) Capa IA
Funciones de Tati:
- bienvenida automática
- clasificación
- extracción de intención
- resumen de conversación
- sugerencia de próxima acción
- respuestas asistidas

### 5) Capa de datos
- PostgreSQL
- logs de eventos
- historial de mensajes
- auditoría

---

## Arquitectura técnica sugerida

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- MVP recomendado: Next.js full-stack (API routes / route handlers)
- Opción escalable: NestJS separado + Next.js admin

### Persistencia e infraestructura
- PostgreSQL
- Prisma
- Realtime: Socket.IO / WebSockets
- Cola: BullMQ + Redis
- Archivos: Cloudinary o S3
- Auth: NextAuth o JWT con sesiones seguras
- Deploy sugerido: Vercel + Railway/Render/Supabase + Redis gestionado

### IA e integraciones
- OpenAI API (Tati)
- Meta Webhooks
- WhatsApp Cloud API
- Instagram Messaging
- Facebook Messenger

---

## Diseño modular del backend
- auth
- users
- channels
- contacts
- conversations
- messages
- pipeline
- tasks
- notes
- automations
- ai
- analytics

---

## Modelo de datos inicial

Tablas principales:
- roles
- users
- channels
- contacts
- contact_identities
- conversations
- messages
- tags
- contact_tags
- pipelines
- pipeline_stages
- deals
- tasks
- notes
- automations
- ai_logs
- audit_logs

Relaciones clave:
- contacto 1:N identidades
- contacto 1:N conversaciones
- conversación 1:N mensajes
- contacto 1:N deals
- contacto 1:N tareas/notas
- usuario 1:N asignaciones (conversaciones, deals, tareas)

---

## Reglas funcionales críticas
1. **Creación automática de lead**: mensaje nuevo sin identidad asociada crea contacto + identidad + conversación.
2. **Deduplicación**: si existe mismo teléfono/identificador, no duplicar contacto.
3. **Prioridad comercial**: intención fuerte de compra => prioridad alta + tarea inmediata.
4. **Resumen automático**: conversaciones largas disparan resumen de Tati.
5. **SLA interno**: lead nuevo sin respuesta en tiempo X => alerta a supervisor.

---

## Endpoints MVP

Auth:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Contacts:
- `GET /api/contacts`
- `POST /api/contacts`
- `GET /api/contacts/:id`
- `PATCH /api/contacts/:id`

Conversations:
- `GET /api/conversations`
- `GET /api/conversations/:id`
- `PATCH /api/conversations/:id`

Messages:
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`

Pipeline:
- `GET /api/deals`
- `POST /api/deals`
- `PATCH /api/deals/:id`
- `GET /api/pipelines`

Tasks:
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`

Notes:
- `POST /api/notes`
- `GET /api/contacts/:id/notes`

Channels / Webhooks:
- `POST /api/webhooks/meta`
- `GET /api/webhooks/meta`

AI:
- `POST /api/ai/classify-lead`
- `POST /api/ai/summarize-conversation`
- `POST /api/ai/suggest-reply`

---

## Prioridades por sprint

### Sprint 1
- login
- estructura dashboard
- contactos
- conversaciones
- modelo de datos

### Sprint 2
- bandeja funcional
- mensajería manual
- notas y tareas
- pipeline comercial

### Sprint 3
- integración Meta inicial
- webhook de entrada
- asociación automática de contactos

### Sprint 4
- Tati básica
- respuestas automáticas
- dashboard inicial

---

## Fuera de alcance MVP
- facturación
- ERP
- inventario
- campañas masivas avanzadas
- app móvil nativa
- multiempresa complejo
- ticketing avanzado

---

## Resultado esperado del MVP
Al finalizar la v1, eQuantum tendrá:
- bandeja única de atención
- base organizada de leads/clientes
- seguimiento comercial visual
- tareas y notas internas
- reportes iniciales
- asistente IA Tati operativa

---

## Frase de posicionamiento
**eQuantum CRM es el centro operativo comercial y conversacional de la empresa: omnicanal, ordenado y preparado para escalar con IA.**
