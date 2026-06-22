import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

type ThemeToggleProps = {
  variant?: 'icon' | 'inline'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'
  const Icon = isDark ? Sun : Moon

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={[
          'inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={label}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-theme bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
