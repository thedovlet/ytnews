import apiClient from './client'
import type { Category, CategoryCreate, CategoryUpdate } from '@/types'

export const categoriesApi = {
  getAll: async (skip = 0, limit = 100): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories/', {
      params: { skip, limit },
    })
    return response.data
  },

  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`)
    return response.data
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/slug/${slug}`)
    return response.data
  },

  create: async (data: CategoryCreate): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories/', data)
    return response.data
  },

  update: async (id: number, data: CategoryUpdate): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
