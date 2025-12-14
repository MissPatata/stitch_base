export const theme = {
  colors: {
    // Primary pastel colors
    primary: "#FFB5D8",
    primaryHover: "#FF9EC8",
    primaryLight: "#FFE4F0",

    // Accent colors
    accent: "#A8E6CF",
    accentHover: "#8FD9B6",
    accentDark: "#5FB88F",

    // Neutral colors
    background: "#FFF9FC",
    surface: "#FFFFFF",
    surfaceHover: "#FFF5FA",
    border: "#F5D7E3",

    // Text colors
    textPrimary: "#2D2838",
    textSecondary: "#6B5D73",
    textMuted: "#9B8FA5",

    // Status colors (for process status pills)
    statusIdea: "#FFE4B5",
    statusPlanning: "#B5D8FF",
    statusInProcess: "#D4A5FF",
    statusCompleted: "#A8E6CF",
  },

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },

  borderRadius: {
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },

  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
}

export type Theme = typeof theme
