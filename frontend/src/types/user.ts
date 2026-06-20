export type UserProfile = {
  id: number
  name: string
  email: string
  preferredLanguage: string
}

export type LoginResponse = {
  accessToken: string
  tokenType: string
  user: UserProfile
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  preferredLanguage: string
}
