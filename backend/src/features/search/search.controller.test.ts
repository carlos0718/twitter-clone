import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Response } from 'express'
import { searchUsersHandler } from './search.controller'
import type { AuthRequest } from '../../shared/types'

vi.mock('./search.service', () => ({
  searchUsers: vi.fn(),
}))

import * as searchService from './search.service'

function mockRes() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response
  vi.mocked(res.status).mockReturnValue(res)
  return res
}

beforeEach(() => vi.clearAllMocks())

describe('searchUsersHandler - success and error branch', () => {
  it('returns users list', async () => {
    vi.mocked(searchService.searchUsers).mockResolvedValue([])
    const req = { userId: 'u1', query: { q: 'alice' } } as unknown as AuthRequest
    const res = mockRes()
    await searchUsersHandler(req, res)
    expect(vi.mocked(res.json)).toHaveBeenCalledWith({ users: [] })
  })

  it('returns 500 on unexpected error', async () => {
    vi.mocked(searchService.searchUsers).mockRejectedValue(new Error('fail'))
    const req = { userId: 'u1', query: { q: 'alice' } } as unknown as AuthRequest
    const res = mockRes()
    await searchUsersHandler(req, res)
    expect(vi.mocked(res.status)).toHaveBeenCalledWith(500)
  })
})
