import type { Response } from 'express'
import type { AuthRequest } from '../../shared/types'
import * as followService from './follow.service'

export async function followHandler(req: AuthRequest, res: Response) {
  try {
    await followService.followUser(req.userId, req.params.userId as string)
    res.status(201).json({ message: 'Followed' })
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}

export async function unfollowHandler(req: AuthRequest, res: Response) {
  try {
    await followService.unfollowUser(req.userId, req.params.userId as string)
    res.status(204).send()
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}

export async function getFollowersHandler(req: AuthRequest, res: Response) {
  try {
    const followers = await followService.getFollowers(req.params.userId as string)
    res.json({ followers })
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}

export async function getFollowingHandler(req: AuthRequest, res: Response) {
  try {
    const following = await followService.getFollowing(req.params.userId as string)
    res.json({ following })
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}
