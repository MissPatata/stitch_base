import { useState, useCallback } from "react"

export function useErrorNotification() {
  const [error, setError] = useState<Error | string | null>(null)

  const showError = useCallback((err: Error | string) => {
    console.error("Error notification:", err)
    setError(err)
  }, [])

  const dismissError = useCallback(() => {
    setError(null)
  }, [])

  return { error, showError, dismissError }
}
