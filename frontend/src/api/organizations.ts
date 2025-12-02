import { apiClient } from './client'
import type { Organization, OrganizationCreate, OrganizationUpdate } from '../types'

export const organizationsApi = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await apiClient.get<Organization[]>('/organizations/', {
      params: { skip, limit }
    })
    return response.data
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Organization>(`/organizations/${id}`)
    return response.data
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<Organization>(`/organizations/slug/${slug}`)
    return response.data
  },

  create: async (data: OrganizationCreate) => {
    const response = await apiClient.post<Organization>('/organizations/', data)
    return response.data
  },

  update: async (id: number, data: OrganizationUpdate) => {
    const response = await apiClient.put<Organization>(`/organizations/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    await apiClient.delete(`/organizations/${id}`)
  }
}
