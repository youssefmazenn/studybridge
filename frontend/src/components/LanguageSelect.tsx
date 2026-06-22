import { Languages } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import type { Language } from '../i18n/translations'

type LanguageSelectProps = {
  compact?: boolean
  className?: string
}

export function LanguageSelect({
  compact = false,
  className = '',
}: LanguageSelectProps) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <label
      className={[
        'inline-flex items-center gap-2 rounded-lg border border-theme bg-muted px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        compact ? 'h-10' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Languages className="h-4 w-4 shrink-0" />
      <span className={compact ? 'sr-only' : ''}>{t('language.switcher')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="bg-transparent text-sm font-semibold text-foreground outline-none"
        aria-label={t('language.switcher')}
      >
        {(['en', 'de'] as Language[]).map((option) => (
          <option key={option} value={option}>
            {compact
              ? option.toUpperCase()
              : t(option === 'en' ? 'language.english' : 'language.german')}
          </option>
        ))}
      </select>
    </label>
  )
}
