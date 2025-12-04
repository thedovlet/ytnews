import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/api/events'
import { useAuthStore } from '@/store/authStore'
import { EventRegistrationCreate } from '@/types'

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()

  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [formData, setFormData] = useState<EventRegistrationCreate>({
    event_id: 0,
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    notes: '',
  })

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['events', slug],
    queryFn: () => eventsApi.getBySlug(slug!),
    enabled: !!slug,
  })

  const registerMutation = useMutation({
    mutationFn: (data: EventRegistrationCreate) => {
      return eventsApi.register(event!.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', slug] })
      alert('Вы успешно зарегистрированы на мероприятие!')
      setShowRegistrationForm(false)
      setFormData({
        event_id: 0,
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        notes: '',
      })
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Ошибка регистрации')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated && (!formData.guest_name || !formData.guest_email)) {
      alert('Пожалуйста, заполните обязательные поля')
      return
    }

    registerMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">Мероприятие не найдено</div>
      </div>
    )
  }

  const eventDate = new Date(event.event_date)
  const isPastEvent = eventDate < new Date()
  const registrationDeadline = event.registration_deadline
    ? new Date(event.registration_deadline)
    : null
  const isRegistrationClosed =
    registrationDeadline && registrationDeadline < new Date()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate('/events')}
        className="mb-6 text-primary-600 hover:text-primary-800 flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Назад к списку мероприятий
      </button>

      {event.cover_image && (
        <img
          src={event.cover_image}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>

      <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{eventDate.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>

        {event.location && (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
        )}

        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>{event.registrations_count} {event.max_participants ? `/ ${event.max_participants}` : ''} участников</span>
        </div>
      </div>

      {event.organization && (
        <div className="mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {event.organization.name}
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Описание</h2>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: event.description }} />
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Организатор</h3>
        <p className="text-gray-700">{event.author.full_name || event.author.email}</p>
      </div>

      {!isPastEvent && !isRegistrationClosed && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {!showRegistrationForm ? (
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 font-medium"
            >
              Зарегистрироваться на мероприятие
            </button>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4">Регистрация на мероприятие</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isAuthenticated && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Имя <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.guest_name}
                        onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.guest_email}
                        onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        value={formData.guest_phone}
                        onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дополнительная информация
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    placeholder="Ваши вопросы или пожелания..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-400"
                  >
                    {registerMutation.isPending ? 'Регистрация...' : 'Подтвердить регистрацию'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegistrationForm(false)}
                    className="px-6 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {isPastEvent && (
        <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-600">
          Это мероприятие уже прошло
        </div>
      )}

      {isRegistrationClosed && !isPastEvent && (
        <div className="bg-yellow-100 rounded-lg p-6 text-center text-yellow-800">
          Регистрация на мероприятие закрыта
        </div>
      )}
    </div>
  )
}
