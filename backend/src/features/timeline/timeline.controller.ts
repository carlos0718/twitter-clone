import type { Response } from 'express'
import type { AuthRequest } from '../../shared/types'
import * as timelineService from './timeline.service'

export async function getTimelineHandler(req: AuthRequest, res: Response) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20))
  try {
    const result = await timelineService.getTimeline(req.userId, page, limit)
    res.json(result)
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}
