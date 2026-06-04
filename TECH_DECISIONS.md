# Decisiones Técnicas — The Flock

Este documento explica el razonamiento detrás de cada elección tecnológica del proyecto.

---

## Stack general

### ¿Por qué dos apps separadas (no un monolito)?

El challenge requiere al menos un backend con DB relacional y al menos un frontend. Separarlos en dos procesos independientes (`backend/` y `frontend/`) permite:

- **Testabilidad limpia**: el backend es una API pura. Se testea con Supertest sin necesidad de levantar el browser.
- **Escalabilidad de responsabilidades**: cada app tiene su propio `package.json`, sus propios scripts, su propio pipeline de CI/CD.
- **Claridad de commits**: los cambios de API y de UI quedan separados en el historial.

Ambas apps viven en el mismo repositorio Git (single-repo sin tooling de monorepo) para simplificar el historial de commits requerido por el challenge.

---

## Backend

### Express.js + TypeScript

**Por qué Express y no NestJS, Fastify o Hono:**

- Express es el framework que más conozco a fondo (3+ proyectos). En 72 horas, usar lo conocido > explorar lo nuevo.
- Express 5 (estable desde 2024) maneja async/await nativamente sin `express-async-errors`.
- La estructura feature-based que uso es independiente del framework: si se quisiera migrar a Fastify, los services y repos no cambian.

**Por qué no NestJS:** NestJS agrega mucho boilerplate (módulos, decoradores, DI container) que no agrega valor en un challenge de 72h. Su curva de setup inicial consume tiempo que prefiero invertir en features y tests.

### PostgreSQL + Prisma ORM

**Por qué PostgreSQL:**
- El challenge lo especifica como preferido.
- El modelo de datos del proyecto (usuarios, follows, likes, tweets) se presta a relaciones bien definidas con foreign keys y constraints.
- Para el timeline (feed de usuarios seguidos), las queries con JOINs y ORDER BY sobre timestamps son triviales en SQL.

**Por qué Prisma y no Drizzle, TypeORM o Sequelize:**
- Prisma genera tipos TypeScript automáticamente desde el schema. Esto reduce errores de tipado en las queries.
- El cliente es inmutable y predecible: no hay ORM "mágico" que haga queries inesperadas.
- Drizzle es una alternativa válida (más cercana a SQL), pero Prisma tiene mejor DX para iterar rápido (schema → migrate → use).

### Autenticación custom (bcrypt + JWT con jose)

**Por qué no Firebase Auth ni Supabase Auth:** el challenge lo prohíbe explícitamente.

**Por qué JWT y no sessions:**
- Sin estado en el servidor: escala horizontalmente sin shared session store.
- Simple de implementar en un solo backend sin Redis.
- El frontend puede incluir el token en headers: fácil de testear con Supertest.

**Por qué `jose` y no `jsonwebtoken`:**
- `jose` es la implementación moderna de JWT/JWK para Node.js. Soporta el Web Crypto API nativo (sin dependencias nativas).
- `jsonwebtoken` es más vieja y tiene deuda técnica en su API async.

**Por qué `bcryptjs` y no `bcrypt` (nativo) o `argon2`:**
- `bcryptjs` es puro JavaScript, sin binarios nativos → sin problemas de compilación en distintas plataformas (Linux, Mac, Windows, Docker).
- `argon2` es más seguro en teoría, pero `bcryptjs` con cost factor 12 es más que suficiente para un challenge.

### Zod para validación

Todas las entradas del usuario se validan con Zod en los controllers. Esto centraliza la validación y genera errores tipados. El mismo schema puede reusarse en el frontend para validación de formularios.

---

## Frontend

### Vite + React 19 + TypeScript

**Por qué Vite y no Next.js:**
- La app es altamente dinámica (todo autenticado, feed en tiempo real, SPA behavior). El SSR de Next.js no agrega valor real para este caso de uso.
- Vite es mi herramienta de build dominante (6+ proyectos). Configuración mínima, HMR instantáneo.
- Evita la complejidad extra de Next.js App Router + Server Actions + hydration para un proyecto donde la API ya está separada.

**Por qué React 19:** estabilidad, ecosistema maduro, experiencia previa sólida.

### Tailwind CSS v4 + shadcn/ui

**Por qué Tailwind v4:**
- Tailwind v4 usa `@tailwindcss/vite` como plugin nativo, sin `tailwind.config.js`. La integración con Vite es más directa.
- La paleta de diseño de Twitter/X (dark mode, colores neutros, tipografía limpia) se mapea naturalmente a variables CSS de Tailwind v4.

**Por qué shadcn/ui:**
- Componentes accesibles (Radix UI) con estilos copiables al repo. No es una dependencia externa que puede romperse → control total sobre los componentes.
- Acelera el desarrollo de UI compleja (Dialogs, Dropdowns, Tooltips) sin sacrificar customización.
- El preset Nova da tipografía Geist que es visualmente similar al estilo de Twitter/X.

### TanStack Query

Manejo de server state: cache automático, refetching, optimistic updates (importante para likes y follows). Evita reimplementar lógica de loading/error/stale en cada componente.

### Framer Motion

Micro-animaciones (transiciones de like, aparición de tweets en el feed) que mejoran la percepción de velocidad sin impactar el bundle significativamente.

---

## Modelado del timeline y el grafo de follows

### Follows

Tabla `follows` con `followerId` y `followingId` (ambos FK a `users`). Un índice compuesto en `(followerId, followingId)` garantiza unicidad y acelera las queries de "¿A quién sigo?".

### Timeline

Query directa con Prisma:

```sql
SELECT tweets.*
FROM tweets
WHERE tweets.authorId IN (
  SELECT followingId FROM follows WHERE followerId = :userId
)
ORDER BY tweets.createdAt DESC
LIMIT :limit OFFSET :offset
```

**Trade-off**: este approach escala bien hasta ~10k follows por usuario. Para usuarios con millones de follows (Twitter real) se usaría un feed pre-computado (fanout on write), pero está fuera del scope del challenge.

### Real-time (SSE)

El endpoint `GET /stream` mantiene una conexión SSE abierta. Cuando un usuario al que seguís publica un tweet, el server emite un evento al cliente. El cliente lo agrega al feed sin recargar.

**Por qué SSE y no WebSockets:** el timeline es unidireccional (server → client). SSE es más simple, usa HTTP estándar, y se reconnecta automáticamente.

---

## Testing

### Backend: Vitest + Supertest (80%+ cobertura)

- **Unit tests**: modelos y servicios en aislamiento, mocking de Prisma Client.
- **Integration tests**: Supertest contra la app Express real con DB de test.
- **E2E**: Playwright cubre el flujo completo de autenticación (register → login → crear tweet → logout).

### Frontend: Testing Library + Playwright

- Integración de los flujos principales (login form, tweet composer, follow button).
- Testing Library testea comportamiento, no implementación.

---

## Docker Compose

Levanta PostgreSQL + API + Frontend con un solo `docker compose up --build`. Simplifica el setup para los evaluadores y cumple con el bonus feature.

---

## Herramientas de AI usadas

- **Claude Code**: setup inicial del proyecto (scaffolding, estructura de carpetas, archivos base), generación de boilerplate de tests, revisión de código, implementación de features completos (backend + frontend), corrección de bugs y mejoras de UI/UX.
- **Claude Sonnet**: consultas de arquitectura, revisión de decisiones técnicas, generación de seed data realista.

### Skills personalizados utilizados

Se utilizaron skills creados por el autor del proyecto para establecer un flujo de trabajo limpio y siguiendo buenas prácticas de desarrollo:

- **`/new-project`**: scaffoldeó el repositorio completo desde cero — estructura feature-based en backend y frontend, archivos de configuración (CLAUDE.md, README.md, TECH_DECISIONS.md, TODO.md, docker-compose.yml, .gitignore) y stack inicial instalado y configurado.
- **`/init`**: inicializó el CLAUDE.md con las convenciones del codebase, arquitectura y comandos frecuentes, asegurando que Claude Code mantuviera coherencia en cada sesión de trabajo.

El flujo de trabajo fue: usar `/new-project` para arrancar con estructura sólida → implementar features iterativamente con Claude Code → commitear por historia de usuario (un commit + push por feature) → revisar y ajustar el output → iterar hasta completar el TODO.

---

## Trade-offs y limitaciones conocidas

| Limitación | Decisión tomada | Alternativa descartada |
|---|---|---|
| Timeline no pre-computado | Query directa (fan-out on read) | Fan-out on write (Redis) — overkill para el challenge |
| Sin rate limiting | No implementado | express-rate-limit (se agregaría en producción) |
| JWT sin blacklist | Tokens no revocables hasta expirar | Redis para blacklist — agrega complejidad |
| Imágenes no implementadas | Solo texto en tweets | Upload a S3/Cloudflare R2 (bonus descartado por tiempo) |
| Notificaciones no implementadas | SSE cubre solo timeline | Sistema de notificaciones completo — demasiado para 72h |

---

## Autor

**Carlos Jesus**
[portfolio-master-carlos-jesus.vercel.app](https://portfolio-master-carlos-jesus.vercel.app/)
