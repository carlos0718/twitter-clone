import { Router } from 'express'
import { requireAuth } from '../../shared/middlewares/auth.middleware'
import { streamHandler } from './stream.controller'

const router = Router()

router.get('/', requireAuth, streamHandler as any)

export default router
