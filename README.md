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
