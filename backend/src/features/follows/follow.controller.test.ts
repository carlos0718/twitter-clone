import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import { unfollowHandler, getFollowersHandler, getFollowingHandler } from './follow.controller'
import type { AuthRequest } from '../../shared/types'

vi.mock('./follow.service', () => ({
  unfollowUser: vi.fn(),
  getFollowers: vi.fn(),
  getFollowing: vi.fn(),
}))

import * as followService from './follow.service'

function mockRes() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() } as unknown as Response
  vi.mocked(res.status).mockReturnValue(res)
  return res
}

function req(userId = 'u1', params = {}) {
  return { userId, params } as unknown as AuthRequest
}

beforeEach(() => vi.clearAllMocks())

describe('unfollowHandler - error branch', () => {
  it('returns 500 on unexpected error', async () => {
    vi.mocked(followService.unfollowUser).mockRejectedValue(new Error('fail'))
    const res = mockRes()
    await unfollowHandler(req('u1', { userId: 'u2' }), res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})

describe('getFollowersHandler - error branch', () => {
  it('returns 500 on unexpected error', async () => {
    vi.mocked(followService.getFollowers).mockRejectedValue(new Error('fail'))
    const res = mockRes()
    await getFollowersHandler(req('u1', { userId: 'u2' }), res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})

describe('getFollowingHandler - error branch', () => {
  it('returns 500 on unexpected error', async () => {
    vi.mocked(followService.getFollowing).mockRejectedValue(new Error('fail'))
    const res = mockRes()
    await getFollowingHandler(req('u1', { userId: 'u2' }), res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})
