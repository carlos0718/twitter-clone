import { api } from '@/lib/api'
import type { User } from './auth.types'

export async function register(data: { username: string; email: string; password: string }) {
  const res = await api.post<{ user: User; token: string }>('/auth/register', data)
  return res.data
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post<{ user: User; token: string }>('/auth/login', data)
  return res.data
}

export async function getMe() {
  const res = await api.get<{ user: User }>('/auth/me')
  return res.data.user
}
