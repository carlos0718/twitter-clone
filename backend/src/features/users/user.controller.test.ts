import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import { getUserProfileHandler, updateProfileHandler } from './user.controller'
import type { AuthRequest } from '../../shared/types'

vi.mock('./user.service', () => ({
  getUserProfile: vi.fn(),
  updateProfile: vi.fn(),
}))

import * as userService from './user.service'

function mockRes() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response
  vi.mocked(res.status).mockReturnValue(res)
  return res
}

beforeEach(() => vi.clearAllMocks())

describe('getUserProfileHandler - error branch', () => {
  it('returns 500 on unexpected error', async () => {
    vi.mocked(userService.getUserProfile).mockRejectedValue(new Error('fail'))
    const req = { userId: 'u1', params: { username: 'alice' } } as unknown as AuthRequest
    const res = mockRes()
    await getUserProfileHandler(req, res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})

describe('updateProfileHandler - error branch', () => {
  it('returns 500 on unexpected error', async () => {
    vi.mocked(userService.updateProfile).mockRejectedValue(new Error('fail'))
    const req = { userId: 'u1', body: { bio: 'hi' } } as unknown as AuthRequest
    const res = mockRes()
    await updateProfileHandler(req, res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})
