import type { CSSProperties, ReactNode } from "react"
import { theme } from "../theme"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "danger"
  size?: "sm" | "md" | "lg"
  type?: "button" | "submit"
  disabled?: boolean
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const getVariantStyles = (): CSSProperties => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.colors.accent,
          color: theme.colors.textPrimary,
        }
      case "secondary":
        return {
          backgroundColor: theme.colors.surface,
          color: theme.colors.textPrimary,
          border: `1px solid ${theme.colors.border}`,
        }
      case "danger":
        return {
          backgroundColor: "#FFB5B5",
          color: theme.colors.textPrimary,
        }
    }
  }

  const getSizeStyles = (): CSSProperties => {
    switch (size) {
      case "sm":
        return {
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          fontSize: "0.875rem",
        }
      case "md":
        return {
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          fontSize: "1rem",
        }
      case "lg":
        return {
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          fontSize: "1.125rem",
        }
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        border: variant !== "secondary" ? "none" : undefined,
        borderRadius: theme.borderRadius.md,
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: "600",
        transition: "all 0.2s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
