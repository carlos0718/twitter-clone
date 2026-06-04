# The Flock — Twitter Clone Challenge

Clon funcional de Twitter/X desarrollado como challenge técnico full-stack de 72 horas.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui |
| Backend | Express.js v5 + TypeScript |
| Base de datos | PostgreSQL 16 + Prisma ORM |
| Autenticación | Custom JWT (bcryptjs + jose) |
| Estado server | TanStack Query v5 |
| Animaciones | Framer Motion |
| Testing | Vitest + Supertest (backend), Testing Library (frontend) |
| Infra | Docker Compose (PostgreSQL + API + Frontend nginx) |

---

## Runbook

### Opción 1 — Docker Compose (recomendado)

```bash
git clone https://github.com/carlos0718/twitter-clone.git
cd twitter-clone
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:3000

> La base de datos se levanta automáticamente. Ejecutar las migraciones manualmente la primera vez:
```bash
docker compose exec api npx prisma migrate deploy
```

---

### Opción 2 — Local (sin Docker)

#### Prerrequisitos
- Node.js 22+
- PostgreSQL 16 corriendo en localhost:5432

#### Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tu DATABASE_URL y JWT_SECRET
npm install
npm run db:migrate   # aplica migraciones
npm run db:seed      # carga datos de prueba
npm run dev          # levanta en http://localhost:3000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev          # levanta en http://localhost:5173
```

---

## Credenciales de ejemplo (seed)

Todos los usuarios tienen la misma contraseña: **`password123`**

| Usuario | Email |
|---|---|
| alice | alice@example.com |
| bob | bob@example.com |
| carol | carol@example.com |
| david | david@example.com |
| eve | eve@example.com |
| frank | frank@example.com |
| grace | grace@example.com |
| henry | henry@example.com |
| iris | iris@example.com |
| jack | jack@example.com |

---

## Tests

### Backend

```bash
cd backend
npm test              # 79 tests (unit + integration)
npm run test:coverage # coverage report (target: 80%+)
```

Resultados actuales: **Stmts 96% · Branches 84% · Funcs 94% · Lines 98%**

### Frontend

```bash
cd frontend
npm test              # 15 tests (Testing Library)
```

---

## Features implementados

- **Auth**: registro, login, logout, JWT stateless
- **Tweets**: crear (280 chars), eliminar (solo propio), ver
- **Timeline**: feed de usuarios seguidos, paginado, TanStack Query
- **Follows**: seguir / dejar de seguir, lista de followers/following
- **Likes**: like / unlike con optimistic update y animación Framer Motion
- **Perfil**: bio, contadores, editar perfil, lista de tweets
- **Búsqueda**: búsqueda por username con debounce 300ms
- **Responsive**: sidebar en tablet+, bottom nav en mobile

---

## Estructura del repo

```
twitter-clone/
├── backend/          Express API (feature-based)
│   ├── src/features/ auth · tweets · timeline · follows · likes · users · search
│   ├── prisma/       schema + migrations + seed
│   └── tests/        integration tests + helpers
├── frontend/         Vite + React SPA
│   └── src/features/ auth · tweets · timeline · users · search
├── docker-compose.yml
├── CLAUDE.md
├── TECH_DECISIONS.md
└── TODO.md
```

---

## Autor

**Carlos Jesus**
[portfolio-master-carlos-jesus.vercel.app](https://portfolio-master-carlos-jesus.vercel.app/)
