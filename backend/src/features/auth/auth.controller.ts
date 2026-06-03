import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import { registerSchema, loginSchema } from './auth.types'
import * as authService from './auth.service'

export async function registerHandler(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }

  try {
    const result = await authService.register(parsed.data)
    res.status(201).json(result)
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }

  try {
    const result = await authService.login(parsed.data)
    res.json(result)
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}

export async function meHandler(req: Request, res: Response) {
  const userId = (req as Request & { userId: string }).userId
  try {
    const user = await authService.getUserById(userId)
    res.json({ user })
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}

export function logoutHandler(_req: Request, res: Response) {
  res.json({ message: 'Logged out' })
}
