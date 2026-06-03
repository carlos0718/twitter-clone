# TODO — The Flock (Twitter Clone)

> Challenge de 72 horas. Rubrica: Funcionalidad 25% · Código 20% · Testing 25% · Proceso 15% · Docs 10% · Bonus 5%
> Orden sugerido: Setup → Auth → Tweets → Social → Timeline → Search → Bonus → Polish

---

## Setup & Infraestructura

- [x] Scaffolding del repo (backend + frontend)
- [x] Dependencias instaladas
- [x] Estructura feature-based creada
- [x] Tailwind v4 + shadcn/ui configurados
- [x] CLAUDE.md, README.md, TECH_DECISIONS.md generados
- [x] Prisma schema definido (User, Tweet, Follow, Like)
- [x] Primera migración aplicada (`prisma migrate dev --name init`)
- [x] `.env` configurado con DB local
- [x] Confirmar que `npm run dev` levanta en backend y frontend

---

## Base de Datos & Modelos

- [x] Schema Prisma: modelo `User` (id, username, email, passwordHash, bio, avatar, createdAt)
- [x] Schema Prisma: modelo `Tweet` (id, content 280 chars, authorId, createdAt)
- [x] Schema Prisma: modelo `Follow` (followerId, followingId, createdAt) — unique constraint
- [x] Schema Prisma: modelo `Like` (userId, tweetId, createdAt) — unique constraint
- [x] Índices: (followerId, followingId), (userId, tweetId), (authorId, createdAt DESC)
- [x] `prisma generate` y confirmar tipos generados

---

## Auth

### Backend
- [x] `POST /api/auth/register` — validación Zod, hash bcrypt, emit JWT
- [x] `POST /api/auth/login` — verificar password, emit JWT
- [x] `POST /api/auth/logout` — respuesta 200 (JWT stateless, el cliente descarta el token)
- [x] `GET /api/auth/me` — devuelve el usuario autenticado
- [x] Middleware `requireAuth` — valida JWT en rutas protegidas
- [x] Manejo de errores: 400 validación, 401 no auth, 409 email/username duplicado
- [x] Tests: register happy path, login incorrecto, token inválido, username duplicado

### Frontend
- [x] Pantalla de Login (form RHF + Zod)
- [x] Pantalla de Register (form RHF + Zod)
- [x] `AuthContext` o store de auth con Zustand
- [x] Persistencia del token en localStorage
- [x] Protected route HOC / wrapper para rutas autenticadas
- [x] Redirect a login si no hay sesión
- [ ] Test de integración: flujo login completo

---

## Tweets

### Backend
- [x] `POST /api/tweets` — crear tweet (máx 280 chars), requiere auth
- [x] `DELETE /api/tweets/:id` — eliminar propio, requiere auth + ownership check
- [x] `GET /api/tweets/:id` — obtener tweet individual
- [x] Validación: content requerido, máx 280 chars
- [x] Tests: crear tweet, eliminar propio, intentar eliminar ajeno (403)

### Frontend
- [x] Componente `TweetComposer` — textarea con contador de caracteres
- [x] Componente `TweetCard` — muestra autor, contenido, timestamp, likes, acciones
- [x] Botón de delete visible solo en tweets propios
- [x] Confirmación antes de eliminar
- [ ] Test de integración: render TweetCard, submit TweetComposer

---

## Timeline

### Backend
- [x] `GET /api/timeline` — tweets de usuarios seguidos, ordenados por createdAt DESC
- [x] Paginación con cursor o offset+limit (`?page=1&limit=20`)
- [ ] Tests: timeline vacío, timeline con tweets, paginación

### Frontend
- [x] Pantalla principal (Home) con el timeline
- [x] Infinite scroll o paginación (botón "Cargar más")
- [x] Loading skeleton mientras carga
- [x] Estado vacío cuando no seguís a nadie
- [x] TanStack Query para cache + refetch automático

---

## Interacciones Sociales

### Backend — Follows
- [x] `POST /api/follows/:userId` — seguir usuario (requiere auth, no seguirse a uno mismo)
- [x] `DELETE /api/follows/:userId` — dejar de seguir
- [x] `GET /api/users/:userId/followers` — lista de seguidores
- [x] `GET /api/users/:userId/following` — lista de seguidos
- [x] Tests: follow, unfollow, no auto-follow, lista followers/following

### Backend — Likes
- [x] `POST /api/likes/:tweetId` — likear tweet
- [x] `DELETE /api/likes/:tweetId` — quitar like
- [x] Contador de likes en respuesta de tweets
- [x] Tests: like, unlike, like duplicado (409 o idempotente)

### Frontend
- [x] Botón Follow/Unfollow en perfil y en TweetCard
- [x] Botón Like con contador animado (Framer Motion)
- [x] Optimistic update en likes (TanStack Query)
- [ ] Listado de followers/following en perfil

---

## Perfil de Usuario

### Backend
- [x] `GET /api/users/:username` — perfil público (tweets, contadores)
- [x] `PUT /api/users/me` — editar bio y avatar (requiere auth)
- [x] Tests: perfil existente, perfil no encontrado (404)

### Frontend
- [x] Pantalla de perfil: avatar, username, bio, contadores (tweets, followers, following)
- [x] Lista de tweets propios en el perfil
- [x] Editar perfil (modal o inline)

---

## Búsqueda

### Backend
- [x] `GET /api/search/users?q=` — búsqueda por username o nombre (ILIKE)
- [x] Tests: búsqueda con resultados, búsqueda vacía

### Frontend
- [x] Barra de búsqueda en el layout
- [x] Resultados con UserCard (avatar + username + botón follow)
- [x] Debounce de 300ms en el input

---

## Responsive Design

- [ ] Layout mobile-first (columna única < 640px)
- [ ] Sidebar izquierda visible en tablet+ (640px+)
- [ ] Sidebar derecha (trending/sugeridos) en desktop (1024px+)
- [ ] Navegación inferior en mobile (Home, Search, Profile)
- [ ] TweetComposer adaptado a mobile (bottom sheet o inline)

---

## Seed Data

- [x] Al menos 10 usuarios con email y password reales
- [x] Cada usuario con bio y varios tweets
- [x] Follows cruzados entre usuarios
- [x] Likes cruzados en tweets
- [x] Ejecutable con `npm run db:seed`
- [ ] Credenciales de ejemplo documentadas en README

---

## Testing (objetivo: 80%+ backend)

- [x] Unit tests: auth.service (register, login, verifyToken)
- [x] Unit tests: tweet.service (create, delete, validación ownership)
- [x] Unit tests: follow.service (follow, unfollow, no self-follow)
- [x] Unit tests: like.service (like, unlike, idempotencia)
- [x] Integration tests: POST /api/auth/register (happy + errors)
- [x] Integration tests: POST /api/auth/login (happy + errors)
- [x] Integration tests: POST /api/tweets (autenticado + no autenticado)
- [x] Integration tests: GET /api/timeline (con y sin follows)
- [x] Integration tests: POST /api/follows/:id
- [ ] E2E Playwright: register → login → crear tweet → logout
- [ ] Frontend: test integración Login form
- [ ] Frontend: test integración TweetComposer
- [ ] Frontend: test integración Follow button
- [x] Verificar `npm run test:coverage` pasa threshold 80%

---

## Bonus — Real-time (SSE)

- [ ] Endpoint `GET /api/stream` — SSE, requiere auth
- [ ] Emitir evento cuando usuario seguido publica tweet
- [ ] Hook `useTimeline` escucha SSE y agrega tweets al feed
- [ ] Indicador "X nuevos tweets" en lugar de insertar directo (UX Twitter)

---

## Bonus — Docker

- [x] `docker-compose.yml` creado (PostgreSQL + API + Frontend)
- [ ] `backend/Dockerfile`
- [ ] `frontend/Dockerfile` (multi-stage: build + nginx serve)
- [ ] `docker compose up --build` levanta todo sin pasos manuales
- [ ] Seed ejecutado automáticamente en el entrypoint de la API

---

## Documentación & Polish

- [ ] README Runbook completo y testeado (seguir los pasos desde cero)
- [x] `.env.example` con todos los valores y descripciones
- [ ] TECH_DECISIONS.md revisado y completo
- [ ] Mensajes de commit descriptivos durante todo el desarrollo
- [ ] Limpiar `console.log` de debug antes de entrega
- [ ] Revisar errores de TypeScript (`tsc --noEmit`)
- [ ] Revisar errores de ESLint (`npm run lint`)
