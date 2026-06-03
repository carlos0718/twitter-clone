import { Router } from 'express'
import { requireAuth } from '../../shared/middlewares/auth.middleware'
import { followHandler, unfollowHandler, getFollowersHandler, getFollowingHandler } from './follow.controller'

const router = Router()

router.post('/:userId', requireAuth, followHandler as any)
router.delete('/:userId', requireAuth, unfollowHandler as any)
router.get('/:userId/followers', requireAuth, getFollowersHandler as any)
router.get('/:userId/following', requireAuth, getFollowingHandler as any)

export default router
