import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TweetCard from './TweetCard'
import type { Tweet } from './tweet.types'

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'author-1', username: 'alice' } }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...p }: any) => <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const baseTweet: Tweet = {
  id: 'tweet-1',
  content: 'Hello world',
  authorId: 'author-1',
  createdAt: new Date().toISOString(),
  author: { id: 'author-1', username: 'alice', avatar: null },
  likesCount: 3,
  isLiked: false,
}

function renderCard(tweet = baseTweet, onLike = vi.fn(), onDelete = vi.fn()) {
  return render(
    <MemoryRouter>
      <TweetCard tweet={tweet} onLike={onLike} onDelete={onDelete} />
    </MemoryRouter>
  )
}

describe('TweetCard', () => {
  it('renders tweet content and author', () => {
    renderCard()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('@alice')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows delete button for own tweets', () => {
    renderCard()
    expect(screen.getByLabelText(/eliminar tweet/i)).toBeInTheDocument()
  })

  it('hides delete button for other users tweets', () => {
    renderCard({ ...baseTweet, authorId: 'other-user' })
    expect(screen.queryByLabelText(/eliminar tweet/i)).not.toBeInTheDocument()
  })

  it('calls onLike when like button is clicked', () => {
    const onLike = vi.fn()
    renderCard(baseTweet, onLike)
    fireEvent.click(screen.getByLabelText(/dar like/i))
    expect(onLike).toHaveBeenCalledWith('tweet-1', false)
  })

  it('shows confirm dialog before delete', () => {
    renderCard()
    fireEvent.click(screen.getByLabelText(/eliminar tweet/i))
    expect(screen.getByText(/eliminar\?/i)).toBeInTheDocument()
    expect(screen.getByText('Sí')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('calls onDelete when confirm "Sí" is clicked', () => {
    const onDelete = vi.fn()
    renderCard(baseTweet, vi.fn(), onDelete)
    fireEvent.click(screen.getByLabelText(/eliminar tweet/i))
    fireEvent.click(screen.getByText('Sí'))
    expect(onDelete).toHaveBeenCalledWith('tweet-1')
  })
})
