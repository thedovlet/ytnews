import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import { UserRole, type User, type UserCreate } from '@/types'
import { useAuthStore } from '@/store/authStore'

export default function UsersPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.USER)
  const [error, setError] = useState('')

  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const resetForm = () => {
    setIsCreating(false)
    setEmail('')
    setPassword('')
    setFullName('')
    setRole(UserRole.USER)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Заполните обязательные поля')
      return
    }

    const data: UserCreate = {
      email,
      password,
      full_name: fullName || undefined,
      role,
    }

    try {
      await createMutation.mutateAsync(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания пользователя')
    }
  }

  const handleToggleActive = async (user: User) => {
    // Запретить деактивировать самого себя
    if (user.id === currentUser?.id) {
      alert('Вы не можете деактивировать свою учетную запись')
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: { is_active: !user.is_active },
      })
    } catch (error) {
      alert('Ошибка при изменении статуса пользователя')
    }
  }

  const handleChangeRole = async (user: User, newRole: UserRole) => {
    // Запретить изменять свою роль
    if (user.id === currentUser?.id) {
      alert('Вы не можете изменить свою роль')
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: { role: newRole },
      })
    } catch (error) {
      alert('Ошибка при изменении роли пользователя')
    }
  }

  const handleDelete = async (id: number, email: string) => {
    // Запретить удалять самого себя
    if (id === currentUser?.id) {
      alert('Вы не можете удалить свою учетную запись')
      return
    }

    if (window.confirm(`Вы уверены, что хотите удалить пользователя "${email}"?`)) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error: any) {
        alert(error.response?.data?.detail || 'Ошибка при удалении пользователя')
      }
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      user: 'bg-gray-100 text-gray-800',
      moderator: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
    }
    const labels = {
      user: 'Пользователь',
      moderator: 'Модератор',
      admin: 'Администратор',
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[role]}`}>
        {labels[role]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Управление пользователями</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Создать пользователя
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Новый пользователь</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Полное имя
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Роль *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="user">Пользователь</option>
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {createMutation.isPending ? 'Создание...' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md font-medium"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Имя
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Роль
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата создания
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id === currentUser?.id ? (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        Администратор (вы)
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user, e.target.value as UserRole)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="user">Пользователь</option>
                        <option value="moderator">Модератор</option>
                        <option value="admin">Администратор</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id === currentUser?.id ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Активен
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Активен' : 'Заблокирован'}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.id === currentUser?.id ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Нет пользователей
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
