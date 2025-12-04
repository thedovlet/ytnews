import apiClient from './client'
import type {
  Event,
  EventList,
  EventCreate,
  EventUpdate,
  EventRegistration,
  EventRegistrationCreate,
} from '@/types'

export const eventsApi = {
  // Get all events
  getAll: async (): Promise<EventList[]> => {
    const response = await apiClient.get('/events/')
    return response.data
  },

  // Get upcoming events
  getUpcoming: async (): Promise<EventList[]> => {
    const response = await apiClient.get('/events/upcoming')
    return response.data
  },

  // Get event by slug
  getBySlug: async (slug: string): Promise<Event> => {
    const response = await apiClient.get(`/events/${slug}`)
    return response.data
  },

  // Create event (moderator/admin)
  create: async (data: EventCreate): Promise<Event> => {
    const response = await apiClient.post('/events/', data)
    return response.data
  },

  // Update event (moderator/admin)
  update: async (id: number, data: EventUpdate): Promise<Event> => {
    const response = await apiClient.put(`/events/${id}`, data)
    return response.data
  },

  // Delete event (admin)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/events/${id}`)
  },

  // Register for event
  register: async (eventId: number, data: EventRegistrationCreate): Promise<EventRegistration> => {
    const response = await apiClient.post(`/events/${eventId}/register`, data)
    return response.data
  },

  // Get my registrations
  getMyRegistrations: async (): Promise<EventRegistration[]> => {
    const response = await apiClient.get('/events/registrations/my')
    return response.data
  },

  // Cancel registration
  cancelRegistration: async (registrationId: number): Promise<void> => {
    await apiClient.delete(`/events/registrations/${registrationId}`)
  },

  // Get event registrations (moderator/admin)
  getEventRegistrations: async (eventId: number): Promise<EventRegistration[]> => {
    const response = await apiClient.get(`/events/${eventId}/registrations`)
    return response.data
  },
}
