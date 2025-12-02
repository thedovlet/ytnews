import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsApi } from '@/api/announcements'
import { categoriesApi } from '@/api/categories'
import { uploadApi } from '@/api/upload'
import TipTapEditor from '@/components/TipTapEditor'
import { AnnouncementStatus } from '@/types'

export default function AnnouncementFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [status, setStatus] = useState<AnnouncementStatus>(AnnouncementStatus.DRAFT)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [error, setError] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  const { data: announcement, isLoading: isLoadingAnnouncement } = useQuery({
    queryKey: ['announcement', id],
    queryFn: () => announcementsApi.getById(Number(id)),
    enabled: isEdit,
  })

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title)
      setSlug(announcement.slug)
      setContent(announcement.content)
      setExcerpt(announcement.excerpt || '')
      setCoverImage(announcement.cover_image || '')
      setStatus(announcement.status)
      setSelectedCategories(announcement.categories.map((c) => c.id))
    }
  }, [announcement])

  const createMutation = useMutation({
    mutationFn: announcementsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
      navigate('/admin/announcements')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => announcementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcement', id] })
      navigate('/admin/announcements')
    },
  })

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!isEdit || slug === generateSlug(announcement?.title || '')) {
      setSlug(generateSlug(value))
    }
  }

  const generateSlug = (text: string): string => {
    const translitMap: { [key: string]: string } = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }

    return text
      .toLowerCase()
      .split('')
      .map((char) => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const response = await uploadApi.uploadImage(file)
        setCoverImage(response.url)
      } catch (error) {
        alert('Ошибка загрузки изображения')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title || !slug || !content) {
      setError('Заполните обязательные поля')
      return
    }

    const data = {
      title,
      slug,
      content,
      excerpt,
      cover_image: coverImage,
      status,
      category_ids: selectedCategories,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data })
      } else {
        await createMutation.mutateAsync(data)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка сохранения')
    }
  }

  if (isEdit && isLoadingAnnouncement) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isEdit ? 'Редактирование объявления' : 'Создание объявления'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Заголовок *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL (slug) *
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            URL адрес объявления. Генерируется автоматически из заголовка.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Краткое описание
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Краткое описание для превью в списке объявлений
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Обложка
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="URL изображения обложки"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="text-sm text-gray-500">
              или загрузите файл:
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              className="mb-2"
            />
          </div>
          {coverImage && (
            <div className="mt-2">
              <img src={coverImage} alt="Cover" className="max-w-xs rounded-lg" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Контент *
          </label>
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Категории
          </label>
          <div className="space-y-2">
            {categories?.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category.id])
                    } else {
                      setSelectedCategories(selectedCategories.filter((id) => id !== category.id))
                    }
                  }}
                  className="mr-2"
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Статус *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
            <option value="archived">В архиве</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Сохранение...'
              : isEdit
              ? 'Обновить'
              : 'Создать'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/announcements')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md font-medium"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}
