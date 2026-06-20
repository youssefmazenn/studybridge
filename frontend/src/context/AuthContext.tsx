import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setBearerToken } from '../api/client'
import * as authApi from '../api/authApi'
import type { UserProfile } from '../types/user'

type AuthContextValue = {
  accessToken: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: {
    name: string
    email: string
    password: string
    preferredLanguage: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    setBearerToken(accessToken)
  }, [accessToken])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.loginWithBasicAuth(email, password)
    setAccessToken(response.accessToken)
    setUser(response.user)
  }, [])

  const register = useCallback(
    async (input: {
      name: string
      email: string
      password: string
      preferredLanguage: string
    }) => {
      await authApi.registerUser(input)
    },
    [],
  )

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: accessToken != null,
      login,
      register,
      logout,
    }),
    [accessToken, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
