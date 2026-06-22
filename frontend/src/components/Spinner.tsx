import { useLanguage } from '../context/LanguageContext'

type SpinnerProps = {
  label?: string
}

export function Spinner({ label }: SpinnerProps) {
  const { t } = useLanguage()

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-primary"
        aria-hidden
      />
      <span className="text-sm font-medium">{label ?? t('common.loading')}</span>
    </div>
  )
}
