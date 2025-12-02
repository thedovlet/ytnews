import { apiClient } from './client'
import type { Employee, EmployeeCreate, EmployeeUpdate } from '../types'

export const employeesApi = {
  getMyOrganizations: async () => {
    const response = await apiClient.get<Employee[]>('/employees/my-organizations')
    return response.data
  },

  getByOrganization: async (organizationId: number) => {
    const response = await apiClient.get<Employee[]>(`/employees/organization/${organizationId}`)
    return response.data
  },

  create: async (data: EmployeeCreate) => {
    const response = await apiClient.post<Employee>('/employees', data)
    return response.data
  },

  update: async (id: number, data: EmployeeUpdate) => {
    const response = await apiClient.put<Employee>(`/employees/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    await apiClient.delete(`/employees/${id}`)
  }
}
