import { theme } from "../theme"

interface TagProps {
  label: string
  onRemove?: () => void
}

export function Tag({ label, onRemove }: TagProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        backgroundColor: theme.colors.primaryLight,
        color: theme.colors.textPrimary,
        borderRadius: theme.borderRadius.full,
        fontSize: "0.875rem",
        fontWeight: "500",
      }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            color: theme.colors.textSecondary,
            cursor: "pointer",
            padding: 0,
            fontSize: "1rem",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </span>
  )
}
