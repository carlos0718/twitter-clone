import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import ProtectedRoute from '@/app/ProtectedRoute'
import Layout from '@/app/Layout'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import TimelinePage from '@/features/timeline/TimelinePage'
import ProfilePage from '@/features/users/ProfilePage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TimelinePage />} />
          <Route path="search" element={<div className="p-8 text-muted-foreground">Search — coming soon</div>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
