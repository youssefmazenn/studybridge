import { api } from './client'
import type { LoginResponse, RegisterRequest, UserProfile } from '../types/user'

export async function registerUser(body: RegisterRequest): Promise<UserProfile> {
  const { data } = await api.post<UserProfile>('/api/v1/auth/register', body)
  return data
}

export async function loginWithBasicAuth(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.get<LoginResponse>('/api/v1/auth/login', {
    auth: {
      username: email,
      password,
    },
  })
  return data
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/api/v1/users/me')
  return data
}
