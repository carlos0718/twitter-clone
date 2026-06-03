import { Router } from 'express'
import { requireAuth } from '../../shared/middlewares/auth.middleware'
import { getUserProfileHandler, updateProfileHandler } from './user.controller'

const router = Router()

router.get('/:username', requireAuth, getUserProfileHandler as any)
router.put('/me', requireAuth, updateProfileHandler as any)

export default router
