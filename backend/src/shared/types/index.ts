import { Request } from 'express'

export interface AuthRequest extends Request {
  userId: string
}

export interface ApiError {
  error: string
  details?: unknown
}
