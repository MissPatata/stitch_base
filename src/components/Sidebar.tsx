import { useI18n } from "../i18n/context";
import { useStore } from "../store";
import { theme } from "../theme";

export function Sidebar() {
  const { t, language, setLanguage } = useI18n();
  const { currentView, setView } = useStore();

  const isDesignsActive = currentView.type.startsWith("design");
  const isPatternsActive = currentView.type.startsWith("pattern");

  return (
    <div
      style={{
        width: "240px",
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.md,
        borderTopRightRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
      }}
    >
      <div style={{ marginBottom: theme.spacing.xl }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: theme.colors.textPrimary,
            margin: 0,
          }}
        >
          Stitch Base
        </h1>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.sm,
        }}
      >
        <button
          onClick={() => setView({ type: "designs-list" })}
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            backgroundColor: isDesignsActive
              ? theme.colors.surface
              : "transparent",
            color: theme.colors.textPrimary,
            border: "none",
            borderRadius: theme.borderRadius.md,
            cursor: "pointer",
            textAlign: "left",
            fontSize: "1rem",
            fontWeight: isDesignsActive ? "600" : "500",
            transition: "all 0.2s",
          }}
        >
          {t.navigation.designs}
        </button>

        <button
          onClick={() => setView({ type: "patterns-list" })}
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            backgroundColor: isPatternsActive
              ? theme.colors.surface
              : "transparent",
            color: theme.colors.textPrimary,
            border: "none",
            borderRadius: theme.borderRadius.md,
            cursor: "pointer",
            textAlign: "left",
            fontSize: "1rem",
            fontWeight: isPatternsActive ? "600" : "500",
            transition: "all 0.2s",
          }}
        >
          {t.navigation.patterns}
        </button>
      </nav>

      <div style={{ marginTop: "auto" }}>
        <label
          style={{
            display: "block",
            marginBottom: theme.spacing.sm,
            fontSize: "0.875rem",
            color: theme.colors.textSecondary,
          }}
        >
          {t.common.language}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "en" | "es")}
          style={{
            width: "100%",
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            cursor: "pointer",
          }}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>
    </div>
  );
}
