import { Link } from 'react-router-dom'

const trending = [
  { category: 'Tecnología · Tendencia', topic: 'TypeScript 6', posts: '12.4K' },
  { category: 'Solo en The Flock · Tendencia', topic: 'React 19', posts: '8.1K' },
  { category: 'Tendencia en Argentina', topic: 'Open Source', posts: '5.3K' },
  { category: 'Tecnología · Tendencia', topic: 'Vite', posts: '4.7K' },
  { category: 'Tendencia en Argentina', topic: 'Node.js', posts: '3.2K' },
]

const suggested = [
  { username: 'alice', bio: 'Frontend dev & coffee addict ☕' },
  { username: 'bob', bio: 'Backend engineer. Go, Rust, TypeScript.' },
  { username: 'grace', bio: 'ML engineer. Turning data into magic.' },
]

export default function RightSidebar() {
  return (
    <div className="space-y-4 pt-2">

      {/* Qué está pasando */}
      <div className="bg-muted/40 rounded-2xl overflow-hidden">
        <h2 className="font-bold text-lg px-4 pt-3 pb-2">Qué está pasando</h2>
        {trending.map((item, i) => (
          <div
            key={i}
            className="px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <p className="text-xs text-muted-foreground">{item.category}</p>
            <p className="font-bold text-sm">{item.topic}</p>
            <p className="text-xs text-muted-foreground">{item.posts} posts</p>
          </div>
        ))}
        <button className="px-4 py-3 text-sm text-primary hover:bg-accent/50 transition-colors w-full text-left">
          Mostrar más
        </button>
      </div>

      {/* A quién seguir */}
      <div className="bg-muted/40 rounded-2xl overflow-hidden">
        <h2 className="font-bold text-lg px-4 pt-3 pb-2">A quién seguir</h2>
        {suggested.map((u) => (
          <Link
            key={u.username}
            to={`/profile/${u.username}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold shrink-0">
                {u.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">@{u.username}</p>
                <p className="text-xs text-muted-foreground truncate">{u.bio}</p>
              </div>
            </div>
            <button
              onClick={(e) => e.preventDefault()}
              className="ml-3 shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border border-foreground hover:bg-foreground/10 transition-colors"
            >
              Seguir
            </button>
          </Link>
        ))}
        <button className="px-4 py-3 text-sm text-primary hover:bg-accent/50 transition-colors w-full text-left">
          Mostrar más
        </button>
      </div>

    </div>
  )
}
