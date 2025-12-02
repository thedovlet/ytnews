import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { announcementsApi } from '@/api/announcements'
import { AnnouncementList } from '@/types'

export default function HomePage() {
  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsApi.getPublished(),
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Загрузка объявлений...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">Ошибка загрузки объявлений</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Объявления</h1>

      {announcements && announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement: AnnouncementList) => (
            <Link
              key={announcement.id}
              to={`/announcements/${announcement.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {announcement.cover_image && (
                <img
                  src={announcement.cover_image}
                  alt={announcement.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {announcement.title}
                </h2>
                {announcement.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{announcement.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{announcement.author.full_name || announcement.author.email}</span>
                  <span>
                    {new Date(announcement.published_at || announcement.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                {announcement.categories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {announcement.categories.map((category) => (
                      <span
                        key={category.id}
                        className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">Нет опубликованных объявлений</div>
      )}
    </div>
  )
}
