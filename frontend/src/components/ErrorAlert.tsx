type ErrorAlertProps = {
  message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) {
    return null
  }
  return (
    <div
      className="rounded-lg border border-red-800/40 bg-red-950/40 px-4 py-3 text-sm text-red-300"
      role="alert"
    >
      {message}
    </div>
  )
}
