import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../../features/auth/auth.service'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const queryToken = req.query.token as string | undefined

  const raw = header?.startsWith('Bearer ') ? header.slice(7) : queryToken
  if (!raw) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const token = raw
  try {
    const userId = await verifyToken(token)
    ;(req as Request & { userId: string }).userId = userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
