import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { organizationsApi } from '@/api/organizations'

export default function OrganizationsPage() {
  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsApi.getAll(),
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Загрузка организаций...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">Ошибка загрузки организаций</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Организации</h1>
      </div>

      {organizations && organizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((organization) => (
            <Link
              key={organization.id}
              to={`/organizations/${organization.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt={organization.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {organization.name}
                </h2>
                {organization.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{organization.description}</p>
                )}
                {organization.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Веб-сайт
                  </a>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">Нет организаций</div>
      )}
    </div>
  )
}
