import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import { unlikeHandler } from './like.controller'
import type { AuthRequest } from '../../shared/types'

vi.mock('./like.service', () => ({
  unlikeTweet: vi.fn(),
}))

import * as likeService from './like.service'

function mockRes() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() } as unknown as Response
  vi.mocked(res.status).mockReturnValue(res)
  return res
}

beforeEach(() => vi.clearAllMocks())

describe('unlikeHandler - error branch', () => {
  it('returns 500 on unexpected error', async () => {
    vi.mocked(likeService.unlikeTweet).mockRejectedValue(new Error('fail'))
    const req = { userId: 'u1', params: { tweetId: 't1' } } as unknown as AuthRequest
    const res = mockRes()
    await unlikeHandler(req, res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})
