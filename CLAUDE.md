# CLAUDE.md — The Flock (Twitter Clone)

## Estructura del repo

Single repo con dos apps independientes:

- `backend/` — Express.js + TypeScript + Prisma + PostgreSQL
- `frontend/` — Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui
- `docker-compose.yml` — levanta todo el stack
- `TECH_DECISIONS.md` — razonamiento de arquitectura

## Comandos frecuentes

### Backend
```bash
cd backend
npm run dev           # dev server (tsx watch)
npm run test          # Vitest
npm run test:coverage # coverage report
npm run db:migrate    # aplicar migraciones
npm run db:seed       # poblar con datos de prueba
```

### Frontend
```bash
cd frontend
npm run dev           # Vite dev server
npm test              # Vitest + Testing Library
npm run build         # build de producción
```

## Convenciones de código

- **Lenguaje**: TypeScript estricto en ambas apps
- **Carpetas**: kebab-case
- **Archivos**: kebab-case (general), PascalCase (componentes React)
- **Arquitectura**: feature-based en ambos lados
- **Validación**: Zod en backend (controllers) y frontend (formularios con RHF)
- **Estilos**: solo clases Tailwind, sin `style={{}}` inline

## Arquitectura backend (por feature)

Cada feature en `src/features/<nombre>/` tiene:
- `<nombre>.controller.ts` — handlers Express, sin lógica de negocio
- `<nombre>.service.ts` — lógica de negocio, llama al repositorio
- `<nombre>.routes.ts` — define las rutas y aplica middlewares
- `<nombre>.test.ts` — unit + integration tests de la feature

## Autenticación

- Registro y login emiten un JWT firmado con `jose` (HS256)
- El token va en el header `Authorization: Bearer <token>`
- El middleware `src/shared/middlewares/auth.middleware.ts` valida el token en rutas protegidas

## Variables de entorno

Ver `backend/.env.example`. Nunca commitear `.env`.

## Testing

- Cobertura mínima requerida: **80%** en backend
- Tests de integración usan una DB de test separada (`twitter_clone_test`)
- E2E con Playwright: flujo completo de autenticación

## Principios de código aplicados

- **No estilos inline** — solo clases Tailwind en componentes React
- **Early returns** — evitar pirámides de if/else
- **Tipado explícito** — props tipadas, sin `any`
- **Funciones cortas** — máximo ~30 líneas por función, partir en helpers si crece

---

## Autor

**Carlos Jesus**
[portfolio-master-carlos-jesus.vercel.app](https://portfolio-master-carlos-jesus.vercel.app/)
