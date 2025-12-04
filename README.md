# HealthTrack# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

Node.js version

- Use Node 22 LTS (or >= 20.12). Older Node versions (e.g., 18.x) will fail building Nitro with an error about getDefaultHighWaterMark from node:stream.
  - If you use nvm: `nvm use` (repo includes `.nvmrc`).
  - If you use asdf: ensure Node 22 and run `asdf install` (repo includes `.node-version`).

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.


## Arquitectura 

- Capas (backend):
  - Dominio (`server/domain/*`): contratos de entrada/salida (p.ej. `CreateUserInput`).
  - Repositorios (`server/repositories/*`): acceso a datos con Drizzle (PostgreSQL/Supabase).
  - Servicios (`server/services/*`): reglas de negocio y validaciones.
  - Controladores (`server/controllers/*`): orquesta servicios para las rutas.
  - Rutas API (`server/api/**`): endpoints HTTP (Nitro/H3).
  - Utilidades (`server/utils/db.ts`, `server/utils/auth.ts`): cliente DB y sesión (cookies firmadas).
  - Esquema DB (`server/db/schema.ts`): definición Drizzle de tablas y tipos.
  - Bootstrap (`server/plugins/bootstrap-db.ts`): SQL idempotente opcional (desactivado por defecto y no corre contra el pooler).

- Frontend (Nuxt 4):
  - Páginas: `pages/login.vue`, `pages/signup.vue`, `pages/dashboard.vue`, `pages/admin/login.vue`, `pages/admin/index.vue`.

  - Entrada App: `app.vue` con botón fijo “Login Admin”.

- Conexión a DB:
  - Drizzle + `pg.Pool` vía Supabase Pooler, con SSL y parámetros para entornos serverless.
  - Variables: `SUPABASE_DB_POOL_URL`, `NUXT_SESSION_SECRET` (obligatoria para cookies firmadas).

## Funcionalidades principales

- Autenticación por email/contraseña:
  - Registro (sólo usuarios): crea cuenta y abre sesión.
  - Login de usuario y login de admin (redirige a su panel si tiene rol).
  - Cookies firmadas (HMAC) con `NUXT_SESSION_SECRET`.

- Roles y protección de rutas:
  - Usuarios autenticados: pueden ver suplementos y agregarlos a su perfil.
  - Admins: CRUD de usuarios y gestión de admins; resumen de usuarios/suplementos.

- Suplementos:
  - Listado público (GET) para que el usuario añada a “sus suplementos”.

## Operaciones CRUD (principales)

- Usuarios (admin):
  - Listar: `GET /api/users`
  - Obtener por id: `GET /api/users/:id`
  - Actualizar: `PUT /api/users/:id` (email, username)
  - Eliminar: `DELETE /api/users/:id`
  - Crear usuarios: se realiza mediante registro de usuario `POST /api/auth/signup` (no desde admin UI).

- Admins (rol):
  - Listar: `GET /api/admins`
  - Asignar rol admin: `POST /api/admins` body `{ userId }`
  - Quitar rol admin: `DELETE /api/admins/:userId`

- Autenticación:
  - Registro: `POST /api/auth/signup` (email, password, username?)
  - Login: `POST /api/auth/login` (email, password)
  - Logout: `POST /api/auth/logout`
  - Sesión actual: `GET /api/auth/me`

- Suplementos:
  - Listar: `GET /api/supplements`
  - Añadir a usuario autenticado: `POST /api/user/supplements` body `{ supplementId, relation? }`

- Resumen admin:
  - `GET /api/admin/summary` → { users, supplements }

## Link deployment

https://healthtrack-peach.vercel.app/

## Video

https://drive.google.com/file/d/1CstcDwbtASy4_F45bvn24v8mnjiXgZLN/view?usp=sharing


## Trabajo Final — HealthTrack

Nombre del proyecto: HealthTrack

Integrantes: completar

Objetivo

- Desarrollar una aplicación web de seguimiento de suplementos con dos perfiles (Cliente y Admin), captura de foto del producto, reconocimiento vía IA (Vision) y flujo de curación/approval por parte de Admin.
- El usuario final puede iniciar sesión, registrar cuenta, buscar en la base de datos, agregar suplementos a su Stack y subir una foto para reconocer productos. El administrador gestiona usuarios, admins y productos pendientes, y publica productos curados.

Alcance y Módulo de IA

- Módulo de IA: integración con el modelo Gemini 2.5 Flash para reconocimiento de etiquetas de suplementos a partir de imágenes, obteniendo nombre del compuesto, marca, forma, serving_size, serving_unit y per_serving.
- Prompt multilingüe (inglés/español) con normalización de términos (form y serving_unit en inglés en singular) y extracción de nutrientes per_serving en snake_case. Ver `server/utils/gemini.ts:1`.
- Coincidencia de productos: prioridad a coincidencia exacta por name+brand (publicado). Si solo coincide el name y existe versión “Generic” publicada, se sugiere usarla o “Submit Brand” para revisión. Ver `server/services/visionService.ts:1`.

Hardware

- Componente de hardware utilizado: cámara del dispositivo del usuario (captura de etiqueta desde el navegador en `pages/add-photo.vue:1`). No se requiere driver nativo ni puente adicional.

Stack Tecnológico

- Frontend: Nuxt 4, Vue 3, Vite. Vistas en `pages/*`, layouts en `layouts/*`.
- Backend: Nitro (Node server) + H3 (`server/api/**` y `server/controllers/**`).
- Base de datos: PostgreSQL (modo pooler de Supabase soportado). ORM: Drizzle. Esquema en `server/db/schema.ts:1`.
- Autenticación: cookies firmadas (HMAC) con `NUXT_SESSION_SECRET`. Utilidades en `server/utils/auth.ts:1`.
- IA (Vision): Gemini 2.5 Flash (Google Generative Language API), cliente en `server/utils/gemini.ts:1`.
- Node.js: 22 LTS recomendado. Ver sección de versiones.

Arquitectura (detallada)

- Capas y Patrones
  - Domain: contratos de entrada/salida en `server/domain/*`.
  - Repository: acceso a datos en `server/repositories/*` (PostgreSQL vía Drizzle). Ej.: `supplementRepository.ts:1` (búsqueda, creación pending, updates, publicación/rechazo, conversión de relaciones).
  - Service: lógica de negocio en `server/services/*`. Ej.: `visionService.ts:1` (reconocimiento + matching) y `authService.ts:1`.
  - Controller: orquestación de servicios en `server/controllers/*`.
  - API Routes (Nitro/H3): `server/api/**` define endpoints REST.
  - Utils: `server/utils/*` (db, auth, gemini).
  - Plugin de bootstrap SQL: `server/plugins/bootstrap-db.ts:1` (idempotente y desactivado por defecto contra pooler).

- Ciclo de Vida (Flujos principales)
  - Autenticación: `POST /api/auth/login` firma cookie; `GET /api/auth/me` expone sesión; `POST /api/auth/logout` invalida cookie.
  - Reconocimiento por foto:
    1) El cliente selecciona o toma foto en `pages/add-photo.vue:1` y envía `multipart/form-data` a `POST /api/vision/supplement`.
    2) En el backend, `server/api/vision/supplement.post.ts:1` llama a `visionService.recognizeSupplementFromImage`.
    3) `visionService` usa `geminiRecognizeSupplement` para extraer campos estructurados y decide:
       - Match exacto (name+brand, publicado) → UI muestra opción “Add to My Stack”.
       - Sugerencia Generic (name coincide, brand distinto) → UI ofrece “Add Generic” o “Submit Brand”.
       - Sin match → crea `supplement` con status `pending` y relación `user_supplements.submitted`.
    4) En Admin, `pages/admin/products.vue:1` permite Curate (PUT + Publish) o Publish directo.
    5) Al publicar, `user_supplements` con `relation='submitted'` se convierten a `relation='uses'`.
  - Mi Stack: `GET /api/user/supplements` lista los suplementos del usuario con `relation='uses'`. Vista `pages/stack.vue:1`.

- Base de Datos
  - Tablas
    - `users`: usuarios finales. Campos principales: `id`, `email`, `username`, `password_hash`, `created_at`.
    - `admins`: rol admin referenciado a `users.id`.
    - `supplements`: catálogo de suplementos con curación. Campos: `id`, `name`, `brand`, `form`, `serving_size`, `serving_unit`, `per_serving` (JSONB), `status`, `created_by`, `created_at`, `reviewed_by`, `reviewed_at`, `review_notes`.
    - `user_supplements`: relaciones usuario↔suplemento con `relation`.
  - Enums
    - `supplement_status`: `draft | pending | published | rejected`.
    - `user_supp_relation`: `added | uses | favorite | submitted`.
  - Índices
    - `supplements`: por `status`, `lower(name)`, `lower(brand)`, y `GIN` sobre `per_serving`.
  - Notas operativas
    - Si se insertaron datos manuales, la secuencia de `supplements.id` puede desalinearse. Endpoint admin para corregir: `POST /api/admin/db/fix-sequences`.
    - Endpoints admin para asegurar enums: `POST /api/admin/db/ensure-enums`.

- Endpoints (principales)
  - Auth
    - `POST /api/auth/signup` — crea usuario.
    - `POST /api/auth/login` — inicia sesión y firma cookie.
    - `POST /api/auth/logout` — cierra sesión.
    - `GET /api/auth/me` — sesión actual.
  - Vision / Suplementos (usuario)
    - `POST /api/vision/supplement` — multipart con `image`; retorna `match`, `generic_suggestion`, `pending` o `no_match`.
    - `POST /api/supplements/submit` — crea `supplement` en `pending` con los datos detectados (brand específico) y relación `submitted`.
    - `GET /api/supplements` — listado simple para vistas públicas.
    - `GET /api/user/supplements` — suplementos del usuario con `relation='uses'`.
    - `POST /api/user/supplements` — agrega relación (`uses`, `added`, `submitted`).
  - Admin
    - `GET /api/admin/summary` — métricas simples (usuarios y suplementos).
    - `GET /api/users` / `GET /api/users/:id` / `PUT /api/users/:id` / `DELETE /api/users/:id` — gestión de usuarios.
    - `GET /api/admins` / `POST /api/admins` / `DELETE /api/admins/:userId` — gestión de admins.
    - `GET /api/supplements/pending` — lista pendientes.
    - `PUT /api/supplements/:id` — actualiza detalles (name, brand, form, serving_size, serving_unit, per_serving).
    - `POST /api/supplements/:id/publish` — publica y convierte `submitted` → `uses`.
    - `POST /api/supplements/:id/reject` — rechaza (con `review_notes`).
    - `POST /api/admin/db/ensure-enums` — asegura enums.
    - `POST /api/admin/db/fix-sequences` — re-alinea secuencias.

- Páginas y Vistas
  - Públicas: `pages/index.vue:1` (landing).
  - Auth: `pages/login.vue:1`, `pages/signup.vue:1`.
  - Cliente: `pages/dashboard.vue:1` (layout), `pages/stack.vue:1` (Mi Stack), `pages/database.vue:1`, `pages/add-photo.vue:1`.
  - Admin: `pages/admin/login.vue:1`, `pages/admin/index.vue:1` (resumen), `pages/admin/users.vue:1`, `pages/admin/database.vue:1`, `pages/admin/products.vue:1` (curación).
  - Layouts: `layouts/default.vue:1`, `layouts/dashboard.vue:1`, `layouts/admin.vue:1`.

Seguridad y Sesiones

- Sesiones mediante cookie firmada (HMAC) con `NUXT_SESSION_SECRET`. Helpers `useAuth`, `requireUser`, `requireAdmin` en `server/utils/auth.ts:1`.
- En producción, cookie con `httpOnly`, `secure` y `sameSite=lax`.

Configuración y Variables de Entorno

- `SUPABASE_DB_POOL_URL` o `DATABASE_URL`: cadena de conexión PostgreSQL.
- `NUXT_SESSION_SECRET`: requerido para firmar cookies.
- `GEMINI_API_KEY`: requerido para llamadas al modelo Vision.
- `NUXT_DB_BOOTSTRAP`: `1/true` para ejecutar bootstrap SQL (no contra pooler de Supabase).

Versiones y Requisitos

- Node.js 22 LTS recomendado (mínimo >= 20.12). Ver `.nvmrc`, `.node-version` y `package.json` (engines).
- Si aparece error de `node:stream getDefaultHighWaterMark`, actualizar Node.

Despliegue

- Actual: Vercel (URL pública en este README). Nitro funciona bien en serverless.
- Opción AWS (propuesta):
  - Backend (Nitro) en ECS Fargate o EC2, `RDS PostgreSQL`, `S3` para estáticos, `CloudWatch` para logs, `Secrets Manager` para secretos.
  - Alternativa serverless: API Gateway + Lambda (Nitro preset) + RDS Proxy + RDS PostgreSQL.

Observabilidad y Logs

- Logs de servidor vía consola; errores de DB/IA se registran con contexto. En despliegue, enviar a `CloudWatch` o equivalente.

Consideraciones de Calidad y Pendientes

- Asegurar enums y secuencias en ambientes con datos precargados (`/api/admin/db/ensure-enums` y `/api/admin/db/fix-sequences`).
- Manejo de rate limits y errores del proveedor IA (reintentos/backoff) como mejora futura.
- Validación y normalización adicional de `per_serving` (diccionario de nutrientes) como mejora futura.
- Internacionalización de UI: textos en español listos; puede ampliarse a i18n completo.
