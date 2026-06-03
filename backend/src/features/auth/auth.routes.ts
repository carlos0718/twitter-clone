import { Router } from 'express'
import { requireAuth } from '../../shared/middlewares/auth.middleware'
import { registerHandler, loginHandler, meHandler, logoutHandler } from './auth.controller'

const router = Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)
router.post('/logout', requireAuth, logoutHandler)
router.get('/me', requireAuth, meHandler)

export default router
