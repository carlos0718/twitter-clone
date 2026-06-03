import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response } from 'express'
import { loginHandler, meHandler } from './auth.controller'

vi.mock('./auth.service', () => ({
  login: vi.fn(),
  getUserById: vi.fn(),
}))

import * as authService from './auth.service'

function mockRes() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response
  vi.mocked(res.status).mockReturnValue(res)
  return res
}

beforeEach(() => vi.clearAllMocks())

describe('loginHandler - error branch', () => {
  it('returns 500 when service throws without statusCode', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('DB exploded'))
    const req = { body: { email: 'a@b.com', password: '123' } } as Request
    const res = mockRes()
    await loginHandler(req, res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})

describe('meHandler - error branch', () => {
  it('returns 500 when getUserById throws without statusCode', async () => {
    vi.mocked(authService.getUserById).mockRejectedValue(new Error('Unexpected'))
    const req = { userId: 'user-1' } as any
    const res = mockRes()
    await meHandler(req, res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})
