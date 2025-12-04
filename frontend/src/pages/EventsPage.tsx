import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { eventsApi } from '@/api/events'
import { EventList } from '@/types'

export default function EventsPage() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsApi.getUpcoming(),
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Загрузка мероприятий...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">Ошибка загрузки мероприятий</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Предстоящие мероприятия</h1>
        <p className="mt-2 text-gray-600">
          Зарегистрируйтесь на интересующие вас события
        </p>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: EventList) => (
            <Link
              key={event.id}
              to={`/events/${event.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {event.cover_image && (
                <img
                  src={event.cover_image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.title}
                </h2>
                {event.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.excerpt}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(event.event_date).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{event.registrations_count} участников</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>Организатор: {event.author.full_name || event.author.email}</span>
                </div>

                {event.organization && (
                  <div className="mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {event.organization.name}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <p className="text-lg mb-2">Нет предстоящих мероприятий</p>
          <p className="text-sm">Следите за обновлениями!</p>
        </div>
      )}
    </div>
  )
}
