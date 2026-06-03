export interface User {
  id: string
  username: string
  email: string
  bio: string | null
  avatar: string | null
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
