# The Flock — Frontend

Frontend del clon de Twitter/X desarrollado como challenge técnico full-stack.

Construido con **Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui**.

## Comandos

```bash
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # build de producción
npm test           # tests (Vitest + Testing Library)
npm run lint       # ESLint
```

## Estructura

```
src/
├── app/            Layout, ProtectedRoute, RightSidebar
├── features/
│   ├── auth/       Login, Register, AuthContext
│   ├── tweets/     TweetCard, TweetComposer
│   ├── timeline/   TimelinePage, SSE hook
│   ├── users/      ProfilePage, user API
│   └── search/     SearchPage
├── lib/            api client, date utils, useDebounce, useTheme
└── components/ui/  shadcn/ui components
```

---

## Autor

**Carlos Jesus**
[portfolio-master-carlos-jesus.vercel.app](https://portfolio-master-carlos-jesus.vercel.app/)
