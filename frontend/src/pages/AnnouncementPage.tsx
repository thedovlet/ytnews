import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { announcementsApi } from '@/api/announcements'

export default function AnnouncementPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data: announcement, isLoading, error } = useQuery({
    queryKey: ['announcement', slug],
    queryFn: () => announcementsApi.getBySlug(slug!),
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">Объявление не найдено</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article>
        {announcement.cover_image && (
          <img
            src={announcement.cover_image}
            alt={announcement.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{announcement.title}</h1>

        <div className="flex items-center justify-between mb-8 text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {announcement.employee && announcement.organization ? (
                <>
                  {announcement.employee.user?.full_name || announcement.author.full_name || announcement.author.email}
                  , {announcement.employee.position} of {announcement.organization.name}
                </>
              ) : (
                announcement.author.full_name || announcement.author.email
              )}
            </span>
            <span>•</span>
            <span>
              {new Date(announcement.published_at || announcement.created_at).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {announcement.categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {announcement.categories.map((category) => (
              <span
                key={category.id}
                className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: announcement.content }}
        />
      </article>
    </div>
  )
}
