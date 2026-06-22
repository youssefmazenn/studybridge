import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  LANGUAGE_LOCALES,
  translations,
  type Language,
} from '../i18n/translations'

type TranslationValues = Record<string, string | number>

type LanguageContextValue = {
  language: Language
  locale: string
  setLanguage: (language: Language) => void
  t: (key: string, values?: TranslationValues) => string
}

const STORAGE_KEY = 'studybridge-language'
const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en'
  }
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'de' || stored === 'en' ? stored : 'en'
}

function interpolate(template: string, values?: TranslationValues): string {
  if (!values) {
    return template
  }
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
    template,
  )
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage)
  }, [])

  const t = useCallback(
    (key: string, values?: TranslationValues) => {
      const template = translations[language][key] ?? translations.en[key] ?? key
      return interpolate(template, values)
    },
    [language],
  )

  const value = useMemo(
    () => ({
      language,
      locale: LANGUAGE_LOCALES[language],
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
