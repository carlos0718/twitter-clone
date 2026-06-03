import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => vi.clearAllMocks())

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('shows validation error on empty submit', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
  })

  it('calls login and navigates to / on success', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@example.com', 'password123')
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('INVALID_CREDENTIALS'))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText(/email o contraseña incorrectos/i)).toBeInTheDocument()
    })
  })
})
