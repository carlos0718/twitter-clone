import { Router } from 'express'
import { requireAuth } from '../../shared/middlewares/auth.middleware'
import { createTweetHandler, deleteTweetHandler, getTweetHandler } from './tweet.controller'

const router = Router()

router.post('/', requireAuth, createTweetHandler as any)
router.delete('/:id', requireAuth, deleteTweetHandler as any)
router.get('/:id', requireAuth, getTweetHandler as any)

export default router
