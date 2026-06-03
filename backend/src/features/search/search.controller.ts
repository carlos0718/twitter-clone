import type { Response } from 'express'
import type { AuthRequest } from '../../shared/types'
import * as searchService from './search.service'

export async function searchUsersHandler(req: AuthRequest, res: Response) {
  const q = (req.query.q as string) ?? ''
  try {
    const users = await searchService.searchUsers(q, req.userId)
    res.json({ users })
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}
