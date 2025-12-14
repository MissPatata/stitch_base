import { theme } from "../theme"
import { useI18n } from "../i18n/context"
import type { ProcessStatus } from "../types"

interface StatusPillProps {
  status: ProcessStatus
}

export function StatusPill({ status }: StatusPillProps) {
  const { t } = useI18n()

  const getStatusColor = () => {
    switch (status) {
      case "idea":
        return theme.colors.statusIdea
      case "planning":
        return theme.colors.statusPlanning
      case "inProcess":
        return theme.colors.statusInProcess
      case "completed":
        return theme.colors.statusCompleted
    }
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        backgroundColor: getStatusColor(),
        color: theme.colors.textPrimary,
        borderRadius: theme.borderRadius.full,
        fontSize: "0.875rem",
        fontWeight: "600",
      }}
    >
      {t.processStatus[status]}
    </span>
  )
}
