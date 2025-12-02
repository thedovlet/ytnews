import apiClient from './client'
import type {
  Announcement,
  AnnouncementList,
  AnnouncementCreate,
  AnnouncementUpdate,
  AnnouncementStatus,
} from '@/types'

export const announcementsApi = {
  getPublished: async (skip = 0, limit = 20): Promise<AnnouncementList[]> => {
    const response = await apiClient.get<AnnouncementList[]>('/announcements/', {
      params: { skip, limit },
    })
    return response.data
  },

  getAll: async (
    skip = 0,
    limit = 100,
    status?: AnnouncementStatus,
    categoryId?: number
  ): Promise<AnnouncementList[]> => {
    const response = await apiClient.get<AnnouncementList[]>('/announcements/all', {
      params: { skip, limit, status, category_id: categoryId },
    })
    return response.data
  },

  getById: async (id: number): Promise<Announcement> => {
    const response = await apiClient.get<Announcement>(`/announcements/${id}`)
    return response.data
  },

  getBySlug: async (slug: string): Promise<Announcement> => {
    const response = await apiClient.get<Announcement>(`/announcements/slug/${slug}`)
    return response.data
  },

  create: async (data: AnnouncementCreate): Promise<Announcement> => {
    const response = await apiClient.post<Announcement>('/announcements/', data)
    return response.data
  },

  update: async (id: number, data: AnnouncementUpdate): Promise<Announcement> => {
    const response = await apiClient.put<Announcement>(`/announcements/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/announcements/${id}`)
  },
}
