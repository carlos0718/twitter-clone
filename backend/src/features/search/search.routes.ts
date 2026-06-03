import { Router } from 'express'
import { requireAuth } from '../../shared/middlewares/auth.middleware'
import { searchUsersHandler } from './search.controller'

const router = Router()

router.get('/users', requireAuth, searchUsersHandler as any)

export default router
