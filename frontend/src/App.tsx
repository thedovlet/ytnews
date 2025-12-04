import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import AnnouncementPage from './pages/AnnouncementPage'
import OrganizationsPage from './pages/OrganizationsPage'
import OrganizationPage from './pages/OrganizationPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AnnouncementsListPage from './pages/admin/AnnouncementsListPage'
import AnnouncementFormPage from './pages/admin/AnnouncementFormPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import UsersPage from './pages/admin/UsersPage'

import { UserRole } from './types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const { loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/announcements/:slug" element={<AnnouncementPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/organizations/:slug" element={<OrganizationPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredRole={UserRole.USER}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole={UserRole.MODERATOR}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute requiredRole={UserRole.MODERATOR}>
                  <AnnouncementsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements/new"
              element={
                <ProtectedRoute requiredRole={UserRole.MODERATOR}>
                  <AnnouncementFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements/edit/:id"
              element={
                <ProtectedRoute requiredRole={UserRole.MODERATOR}>
                  <AnnouncementFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute requiredRole={UserRole.MODERATOR}>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
