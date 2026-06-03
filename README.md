# The Flock — Twitter Clone Challenge

Clon funcional de Twitter/X desarrollado como challenge técnico full-stack.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui |
| Backend | Express.js + TypeScript |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | Custom JWT (bcrypt + jose) |
| Testing | Vitest + Supertest (backend), Testing Library + Playwright (frontend/E2E) |
| Real-time | Server-Sent Events (SSE) |
| Infra | Docker Compose |

---

## Runbook

### Prerrequisitos

- Node.js 22+
- npm 10+
- PostgreSQL 16+ (o Docker + Docker Compose)

### Instalación

```bash
git clone <repo-url>
cd twitter-clone

# Backend
cd backend
cp .env.example .env
# Editá .env con tus credenciales de PostgreSQL
npm install
npm run db:migrate
npm run db:seed

# Frontend (nueva terminal)
cd ../frontend
npm install
```

### Levantar en desarrollo

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- API: http://localhost:3001
- App: http://localhost:5173

### Levantar con Docker (alternativa)

```bash
docker compose up --build
```

- App: http://localhost:5173
- API: http://localhost:3001

### Correr tests

```bash
# Backend (unit + integration)
cd backend && npm run test

# Backend con coverage
cd backend && npm run test:coverage

# Frontend
cd frontend && npm test

# E2E (Playwright)
cd backend && npx playwright test
```

### Variables de entorno

Ver `backend/.env.example` para la lista completa con descripciones.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://user:pass@localhost:5432/twitter_clone` |
| `JWT_SECRET` | Clave para firmar tokens (mín. 32 chars) | `my-super-secret-key-32-chars-min` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `PORT` | Puerto del servidor | `3001` |

### Credenciales de ejemplo (seed)

Una vez corrido el seed, podés ingresar con:

```
Email:    alice@example.com
Password: Password123!
```

---

## Decisiones técnicas

Ver [TECH_DECISIONS.md](./TECH_DECISIONS.md) para el detalle completo de decisiones de arquitectura, trade-offs y uso de herramientas de AI.
