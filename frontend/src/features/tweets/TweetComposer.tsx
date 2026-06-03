import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'

const MAX = 280

interface Props {
  onSubmit: (content: string) => Promise<void>
}

export default function TweetComposer({ onSubmit }: Props) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const remaining = MAX - content.length
  const overLimit = remaining < 0
  const isEmpty = content.trim().length === 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEmpty || overLimit || loading) return
    setLoading(true)
    try {
      await onSubmit(content.trim())
      setContent('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-border px-4 py-3">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold shrink-0">
          {user?.username[0].toUpperCase()}
        </div>

        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué está pasando?"
            rows={3}
            className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            aria-label="Contenido del tweet"
          />

          <div className="flex items-center justify-between">
            <span className={`text-xs tabular-nums ${overLimit ? 'text-destructive' : remaining <= 20 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
              {remaining}
            </span>
            <Button type="submit" size="sm" disabled={isEmpty || overLimit || loading}>
              {loading ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
