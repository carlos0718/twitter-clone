import type { Response } from 'express'
import type { AuthRequest } from '../../shared/types'
import * as likeService from './like.service'

export async function likeHandler(req: AuthRequest, res: Response) {
  try {
    await likeService.likeTweet(req.userId, req.params.tweetId as string)
    res.status(201).json({ message: 'Liked' })
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}

export async function unlikeHandler(req: AuthRequest, res: Response) {
  try {
    await likeService.unlikeTweet(req.userId, req.params.tweetId as string)
    res.status(204).send()
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}
