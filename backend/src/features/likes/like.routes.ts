import { Router } from 'express'
import { requireAuth } from '../../shared/middlewares/auth.middleware'
import { likeHandler, unlikeHandler } from './like.controller'

const router = Router()

router.post('/:tweetId', requireAuth, likeHandler as any)
router.delete('/:tweetId', requireAuth, unlikeHandler as any)

export default router
