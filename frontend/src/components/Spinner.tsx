type SpinnerProps = {
  label?: string
}

export function Spinner({ label = 'Loading…' }: SpinnerProps) {
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
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
