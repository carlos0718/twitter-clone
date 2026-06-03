import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Button } from '@/components/ui/button'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Requerido'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch {
      setError('root', { message: 'Email o contraseña incorrectos' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">The Flock</h1>
          <p className="text-muted-foreground">Iniciá sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="tu@email.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {errors.root && (
            <p className="text-sm text-destructive text-center">{errors.root.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
