import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { employeesApi } from '@/api/employees'
import { organizationsApi } from '@/api/organizations'
import { joinRequestsApi } from '@/api/joinRequests'
import { useAuthStore } from '@/store/authStore'
import type { OrganizationCreate } from '@/types'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [showCreateOrg, setShowCreateOrg] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState<OrganizationCreate>({
    name: '',
    slug: '',
    description: '',
    logo: '',
    website: '',
    email: '',
  })

  const { data: employments, isLoading } = useQuery({
    queryKey: ['my-organizations'],
    queryFn: () => employeesApi.getMyOrganizations(),
  })

  const createOrgMutation = useMutation({
    mutationFn: (data: OrganizationCreate) => organizationsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['my-organizations'] })
      setShowCreateOrg(false)
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo: '',
        website: '',
        email: '',
      })
      setSuccessMessage(`Организация "${data.name}" успешно создана! Вы являетесь основателем.`)
      setTimeout(() => setSuccessMessage(''), 5000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createOrgMutation.mutate(formData)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Пожалуйста, войдите в систему</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Профиль</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Личная информация</h2>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          {user.full_name && (
            <p>
              <span className="font-semibold">Имя:</span> {user.full_name}
            </p>
          )}
          <p>
            <span className="font-semibold">Роль:</span> {user.role}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Мои организации</h2>
          <button
            onClick={() => setShowCreateOrg(!showCreateOrg)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            {showCreateOrg ? 'Отмена' : 'Создать организацию'}
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {showCreateOrg && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Название организации *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Веб-сайт
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email организации
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                  URL логотипа
                </label>
                <input
                  type="url"
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={createOrgMutation.isPending}
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {createOrgMutation.isPending ? 'Создание...' : 'Создать организацию'}
              </button>

              {createOrgMutation.isError && (
                <div className="text-red-600 text-sm">
                  Ошибка при создании организации
                </div>
              )}
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center text-gray-600">Загрузка...</div>
        ) : employments && employments.length > 0 ? (
          <div className="space-y-4">
            {employments.map((employment) => (
              <OrganizationCard key={employment.id} employment={employment} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            Вы не являетесь сотрудником ни одной организации
          </div>
        )}
      </div>
    </div>
  )
}

function OrganizationCard({ employment }: { employment: any }) {
  const queryClient = useQueryClient()
  const [showJoinRequests, setShowJoinRequests] = useState(false)

  const { data: joinRequests } = useQuery({
    queryKey: ['join-requests', employment.organization_id],
    queryFn: () => joinRequestsApi.getByOrganization(employment.organization_id),
    enabled: showJoinRequests,
  })

  const acceptMutation = useMutation({
    mutationFn: (id: number) => joinRequestsApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['join-requests', employment.organization_id] })
      queryClient.invalidateQueries({ queryKey: ['employees', employment.organization_id] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => joinRequestsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['join-requests', employment.organization_id] })
    },
  })

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Link
            to={`/organizations/${employment.organization?.slug}`}
            className="text-lg font-semibold text-gray-900 hover:text-primary-600"
          >
            {employment.organization?.name}
          </Link>
          <p className="text-gray-600">{employment.position}</p>
          {employment.can_post && (
            <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Может публиковать
            </span>
          )}
        </div>
        <button
          onClick={() => setShowJoinRequests(!showJoinRequests)}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {showJoinRequests ? 'Скрыть запросы' : 'Показать запросы'}
        </button>
      </div>

      {showJoinRequests && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-2">Запросы на присоединение</h4>
          {joinRequests && joinRequests.length > 0 ? (
            <div className="space-y-3">
              {joinRequests.map((request) => (
                <div key={request.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {request.user.full_name || request.user.email}
                      </p>
                      <p className="text-sm text-gray-600">Должность: {request.position}</p>
                      {request.message && (
                        <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptMutation.mutate(request.id)}
                        disabled={acceptMutation.isPending}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Принять
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(request.id)}
                        disabled={rejectMutation.isPending}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Нет новых запросов</p>
          )}
        </div>
      )}
    </div>
  )
}
