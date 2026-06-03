import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TweetComposer from './TweetComposer'

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { username: 'testuser', id: 'u1' } }),
}))

describe('TweetComposer', () => {
  const onSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    onSubmit.mockResolvedValue(undefined)
  })

  it('renders textarea and submit button', () => {
    render(<TweetComposer onSubmit={onSubmit} />)
    expect(screen.getByPlaceholderText(/qué está pasando/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /publicar/i })).toBeInTheDocument()
  })

  it('submit button is disabled when content is empty', () => {
    render(<TweetComposer onSubmit={onSubmit} />)
    expect(screen.getByRole('button', { name: /publicar/i })).toBeDisabled()
  })

  it('shows character counter decreasing as user types', async () => {
    render(<TweetComposer onSubmit={onSubmit} />)
    const textarea = screen.getByPlaceholderText(/qué está pasando/i)
    await userEvent.type(textarea, 'Hola')
    expect(screen.getByText('276')).toBeInTheDocument()
  })

  it('calls onSubmit with trimmed content and clears textarea', async () => {
    render(<TweetComposer onSubmit={onSubmit} />)
    const textarea = screen.getByPlaceholderText(/qué está pasando/i)
    await userEvent.type(textarea, 'Mi primer tweet')
    await userEvent.click(screen.getByRole('button', { name: /publicar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('Mi primer tweet')
      expect(textarea).toHaveValue('')
    })
  })

  it('disables submit when over 280 chars', async () => {
    render(<TweetComposer onSubmit={onSubmit} />)
    const textarea = screen.getByPlaceholderText(/qué está pasando/i)
    await userEvent.type(textarea, 'a'.repeat(281))
    expect(screen.getByRole('button', { name: /publicar/i })).toBeDisabled()
  })
})
