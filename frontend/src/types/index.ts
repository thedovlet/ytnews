export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface User {
  id: number
  email: string
  full_name?: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at?: string
}

export interface Organization {
  id: number
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Employee {
  id: number
  user_id: number
  organization_id: number
  position: string
  is_active: boolean
  can_post: boolean
  created_at: string
  user?: User
  organization?: Organization
}

export interface Announcement {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image?: string
  status: AnnouncementStatus
  author_id: number
  author: User
  categories: Category[]
  organization_id?: number
  employee_id?: number
  organization?: Organization
  employee?: Employee
  published_at?: string
  created_at: string
  updated_at?: string
}

export interface AnnouncementList {
  id: number
  title: string
  slug: string
  excerpt?: string
  cover_image?: string
  status: AnnouncementStatus
  author: User
  categories: Category[]
  organization_id?: number
  employee_id?: number
  published_at?: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface UserCreate {
  email: string
  password: string
  full_name?: string
  role: UserRole
}

export interface UserUpdate {
  email?: string
  password?: string
  full_name?: string
  role?: UserRole
  is_active?: boolean
}

export interface CategoryCreate {
  name: string
  slug: string
  description?: string
}

export interface CategoryUpdate {
  name?: string
  slug?: string
  description?: string
}

export interface AnnouncementCreate {
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image?: string
  status: AnnouncementStatus
  category_ids: number[]
  organization_id?: number
  employee_id?: number
}

export interface AnnouncementUpdate {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  cover_image?: string
  status?: AnnouncementStatus
  category_ids?: number[]
  organization_id?: number
  employee_id?: number
}

export interface OrganizationCreate {
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  email?: string
}

export interface OrganizationUpdate {
  name?: string
  slug?: string
  description?: string
  logo?: string
  website?: string
  email?: string
  is_active?: boolean
}

export interface EmployeeCreate {
  user_id: number
  organization_id: number
  position: string
  can_post?: boolean
}

export interface EmployeeUpdate {
  position?: string
  is_active?: boolean
  can_post?: boolean
}

export enum JoinRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface JoinRequest {
  id: number
  user_id: number
  organization_id: number
  position: string
  message?: string
  status: JoinRequestStatus
  created_at: string
  updated_at?: string
  user: User
  organization: Organization
}

export interface JoinRequestCreate {
  organization_id: number
  position: string
  message?: string
}
