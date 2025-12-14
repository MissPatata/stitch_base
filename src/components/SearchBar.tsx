import { theme } from "../theme"
import { useI18n } from "../i18n/context"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useI18n()

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t.common.search}
      style={{
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.surface,
        color: theme.colors.textPrimary,
        fontSize: "1rem",
        width: "100%",
        maxWidth: "400px",
      }}
    />
  )
}
