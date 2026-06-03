import type { Request, Response } from 'express'
import type { AuthRequest } from '../../shared/types'
import { updateProfileSchema } from './user.types'
import * as userService from './user.service'

export async function getUserProfileHandler(req: Request & { userId?: string }, res: Response) {
  try {
    const profile = await userService.getUserProfile(req.params.username as string, req.userId)
    res.json({ profile })
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}

export async function updateProfileHandler(req: AuthRequest, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }
  try {
    const user = await userService.updateProfile(req.userId, parsed.data)
    res.json({ user })
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}
