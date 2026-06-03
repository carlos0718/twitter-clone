import { Router } from 'express'
import { requireAuth } from '../../shared/middlewares/auth.middleware'
import { getUserProfileHandler, updateProfileHandler } from './user.controller'

const router = Router()

router.put('/me', requireAuth, updateProfileHandler as any)
router.get('/:username', requireAuth, getUserProfileHandler as any)

export default router
