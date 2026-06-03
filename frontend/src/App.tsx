import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import ProtectedRoute from '@/app/ProtectedRoute'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground">
              <p className="p-8 text-center text-muted-foreground">Home — coming soon</p>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
