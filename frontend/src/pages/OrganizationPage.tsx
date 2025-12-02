import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { organizationsApi } from '@/api/organizations'
import { employeesApi } from '@/api/employees'
import { joinRequestsApi } from '@/api/joinRequests'
import { useAuthStore } from '@/store/authStore'
import type { JoinRequestCreate } from '@/types'

export default function OrganizationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [joinFormData, setJoinFormData] = useState<JoinRequestCreate>({
    organization_id: 0,
    position: '',
    message: '',
  })

  const { data: organization, isLoading: orgLoading, error: orgError } = useQuery({
    queryKey: ['organization', slug],
    queryFn: () => organizationsApi.getBySlug(slug!),
    enabled: !!slug,
  })

  const { data: employees, isLoading: empLoading } = useQuery({
    queryKey: ['employees', organization?.id],
    queryFn: () => employeesApi.getByOrganization(organization!.id),
    enabled: !!organization?.id,
  })

  const { data: myEmployments } = useQuery({
    queryKey: ['my-organizations'],
    queryFn: () => employeesApi.getMyOrganizations(),
    enabled: isAuthenticated,
  })

  const joinRequestMutation = useMutation({
    mutationFn: (data: JoinRequestCreate) => joinRequestsApi.create(data),
    onSuccess: () => {
      setShowJoinForm(false)
      setJoinFormData({ organization_id: 0, position: '', message: '' })
      alert('Запрос на присоединение отправлен!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Ошибка при отправке запроса')
    },
  })

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (organization) {
      joinRequestMutation.mutate({
        ...joinFormData,
        organization_id: organization.id,
      })
    }
  }

  const isEmployee = myEmployments?.some(emp => emp.organization_id === organization?.id)

  if (orgLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (orgError || !organization) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">Организация не найдена</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {organization.logo && (
          <img
            src={organization.logo}
            alt={organization.name}
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold text-gray-900">{organization.name}</h1>
            {isAuthenticated && !isEmployee && (
              <button
                onClick={() => setShowJoinForm(!showJoinForm)}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                {showJoinForm ? 'Отмена' : 'Присоединиться'}
              </button>
            )}
          </div>

          {showJoinForm && (
            <form onSubmit={handleJoinSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Запрос на присоединение</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Желаемая должность *
                  </label>
                  <input
                    type="text"
                    id="position"
                    value={joinFormData.position}
                    onChange={(e) => setJoinFormData({ ...joinFormData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                    placeholder="Например: Software Engineer"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Сообщение (необязательно)
                  </label>
                  <textarea
                    id="message"
                    value={joinFormData.message}
                    onChange={(e) => setJoinFormData({ ...joinFormData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Расскажите о себе и почему хотите присоединиться"
                  />
                </div>
                <button
                  type="submit"
                  disabled={joinRequestMutation.isPending}
                  className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {joinRequestMutation.isPending ? 'Отправка...' : 'Отправить запрос'}
                </button>
              </div>
            </form>
          )}

          {organization.description && (
            <p className="text-gray-600 mb-6 text-lg">{organization.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {organization.website && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Веб-сайт</h3>
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  {organization.website}
                </a>
              </div>
            )}

            {organization.email && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Email</h3>
                <a
                  href={`mailto:${organization.email}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {organization.email}
                </a>
              </div>
            )}
          </div>

          {employees && employees.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Сотрудники</h2>
              {empLoading ? (
                <div className="text-center text-gray-600">Загрузка сотрудников...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">
                        {employee.user?.full_name || employee.user?.email || 'Неизвестно'}
                      </h3>
                      <p className="text-gray-600 text-sm">{employee.position}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
