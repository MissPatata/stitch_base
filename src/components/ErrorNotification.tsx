import { useEffect, useState } from "react"
import { theme } from "../theme"

interface ErrorNotificationProps {
  error: Error | string | null
  onDismiss: () => void
}

export function ErrorNotification({ error, onDismiss }: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Wait for animation
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, onDismiss])

  if (!error) return null

  const errorMessage = typeof error === "string" ? error : error.message
  const errorStack = typeof error === "string" ? null : error.stack

  return (
    <div
      style={{
        position: "fixed",
        top: theme.spacing.lg,
        right: theme.spacing.lg,
        zIndex: 10000,
        maxWidth: "400px",
        backgroundColor: "#FF4444",
        color: "white",
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadow.lg,
        transform: isVisible ? "translateX(0)" : "translateX(calc(100% + 2rem))",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: theme.spacing.md,
          marginBottom: theme.spacing.sm,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "1rem", marginBottom: theme.spacing.xs }}>
            ⚠️ Error
          </div>
          <div style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>{errorMessage}</div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onDismiss, 300)
          }}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "1.25rem",
            padding: 0,
            lineHeight: 1,
            opacity: 0.8,
          }}
        >
          ×
        </button>
      </div>
      {errorStack && (
        <details
          style={{
            marginTop: theme.spacing.sm,
            fontSize: "0.75rem",
            opacity: 0.9,
          }}
        >
          <summary style={{ cursor: "pointer", marginBottom: theme.spacing.xs }}>Stack trace</summary>
          <pre
            style={{
              margin: 0,
              padding: theme.spacing.sm,
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: theme.borderRadius.sm,
              overflow: "auto",
              maxHeight: "200px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {errorStack}
          </pre>
        </details>
      )}
    </div>
  )
}
