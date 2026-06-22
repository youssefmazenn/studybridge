import { useLanguage } from '../context/LanguageContext'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const { t } = useLanguage()
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 max-w-lg text-muted-foreground">{description}</p>
      <div className="mt-8 rounded-xl border border-dashed border-white/15 bg-muted p-8 text-center text-sm text-muted-foreground">
        {t('placeholder.comingSoon')}
      </div>
    </div>
  )
}
