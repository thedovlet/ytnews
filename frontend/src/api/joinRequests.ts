import { apiClient } from './client'
import type { JoinRequest, JoinRequestCreate } from '../types'

export const joinRequestsApi = {
  create: async (data: JoinRequestCreate) => {
    const response = await apiClient.post<JoinRequest>('/join-requests/', data)
    return response.data
  },

  getByOrganization: async (organizationId: number) => {
    const response = await apiClient.get<JoinRequest[]>(`/join-requests/organization/${organizationId}`)
    return response.data
  },

  accept: async (joinRequestId: number) => {
    const response = await apiClient.post<JoinRequest>(`/join-requests/${joinRequestId}/accept`)
    return response.data
  },

  reject: async (joinRequestId: number) => {
    const response = await apiClient.post<JoinRequest>(`/join-requests/${joinRequestId}/reject`)
    return response.data
  }
}
