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
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: {
    name: string
    email: string
    password: string
    preferredLanguage: string
  }) => Promise<UserProfile>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'studybridge-access-token'

function getInitialAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.sessionStorage.getItem(STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    getInitialAccessToken,
  )
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(() => getInitialAccessToken() != null)

  useEffect(() => {
    setBearerToken(accessToken)

    if (accessToken) {
      window.sessionStorage.setItem(STORAGE_KEY, accessToken)
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY)
      setUser(null)
      setIsLoading(false)
      return
    }

    if (user) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function hydrateUser() {
      setIsLoading(true)
      try {
        const profile = await authApi.fetchCurrentUser()
        if (!cancelled) {
          setUser(profile)
        }
      } catch {
        if (!cancelled) {
          setAccessToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void hydrateUser()

    return () => {
      cancelled = true
    }
  }, [accessToken, user])

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
      return authApi.registerUser(input)
    },
    [],
  )

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    setIsLoading(false)
  }, [])

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: accessToken != null && user != null,
      isLoading,
      login,
      register,
      logout,
    }),
    [accessToken, user, isLoading, login, register, logout],
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
