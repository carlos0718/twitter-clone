import { Router } from 'express'
import { requireAuth } from '../../shared/middlewares/auth.middleware'
import { getTimelineHandler } from './timeline.controller'

const router = Router()

router.get('/', requireAuth, getTimelineHandler as any)

export default router
