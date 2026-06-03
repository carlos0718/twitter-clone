import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from './ProfilePage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ username: 'bob' }) }
})

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', username: 'alice' }, setUser: vi.fn() }),
}))

vi.mock('./user.api', () => ({
  getUserProfile: vi.fn().mockResolvedValue({
    id: 'user-2',
    username: 'bob',
    bio: 'Backend engineer',
    avatar: null,
    createdAt: new Date().toISOString(),
    tweetsCount: 0,
    followersCount: 2,
    followingCount: 1,
    isFollowing: false,
    tweets: [],
  }),
  followUser: vi.fn().mockResolvedValue(undefined),
  unfollowUser: vi.fn().mockResolvedValue(undefined),
  updateProfile: vi.fn(),
}))

vi.mock('@/features/tweets/tweet.api', () => ({
  deleteTweet: vi.fn(),
  likeTweet: vi.fn(),
  unlikeTweet: vi.fn(),
}))

function renderProfile() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => vi.clearAllMocks())

describe('Follow button in ProfilePage', () => {
  it('renders Follow button for another user', async () => {
    renderProfile()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /seguir/i })).toBeInTheDocument()
    })
  })

  it('calls followUser when Follow is clicked', async () => {
    const { followUser } = await import('./user.api')
    renderProfile()

    await waitFor(() => screen.getByRole('button', { name: /seguir/i }))
    fireEvent.click(screen.getByRole('button', { name: /seguir/i }))

    await waitFor(() => {
      expect(followUser).toHaveBeenCalledWith('user-2')
    })
  })
})
