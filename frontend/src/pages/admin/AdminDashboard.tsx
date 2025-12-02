import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === UserRole.ADMIN

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Административная панель</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/announcements"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Объявления</h2>
          <p className="text-gray-600">Управление объявлениями</p>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Категории</h2>
          <p className="text-gray-600">Управление категориями</p>
        </Link>

        {isAdmin && (
          <Link
            to="/admin/users"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Пользователи</h2>
            <p className="text-gray-600">Управление пользователями</p>
          </Link>
        )}
      </div>
    </div>
  )
}
