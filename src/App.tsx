import { useEffect } from "react"
import { I18nProvider } from "./i18n/context"
import { useStore } from "./store"
import { Sidebar } from "./components/Sidebar"
import { ErrorNotification } from "./components/ErrorNotification"
import { useErrorNotification } from "./hooks/useErrorNotification"
import { DesignsList } from "./views/DesignsList"
import { DesignDetail } from "./views/DesignDetail"
import { DesignEdit } from "./views/DesignEdit"
import { PatternsList } from "./views/PatternsList"
import { PatternDetail } from "./views/PatternDetail"
import { PatternEdit } from "./views/PatternEdit"
import { theme } from "./theme"

function AppContent() {
  const { currentView, initialize, isLoading } = useStore()
  const { error, showError, dismissError } = useErrorNotification()

  useEffect(() => {
    console.log("🔄 Initializing app...")
    initialize().catch((error) => {
      console.error("❌ Failed to initialize app:", error)
      showError(error instanceof Error ? error : new Error(String(error)))
    })
  }, [initialize, showError])

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      showError(event.error || new Error(event.message))
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      showError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)))
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [showError])

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: theme.colors.textSecondary,
        }}
      >
        Loading...
      </div>
    )
  }

  const renderView = () => {
    switch (currentView.type) {
      case "designs-list":
        return <DesignsList />
      case "design-detail":
        return <DesignDetail id={currentView.id} />
      case "design-edit":
        return <DesignEdit id={currentView.id} />
      case "patterns-list":
        return <PatternsList />
      case "pattern-detail":
        return <PatternDetail id={currentView.id} />
      case "pattern-edit":
        return <PatternEdit id={currentView.id} />
      default:
        return <DesignsList />
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: theme.colors.background }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto" }}>{renderView()}</main>
      <ErrorNotification error={error} onDismiss={dismissError} />
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}
