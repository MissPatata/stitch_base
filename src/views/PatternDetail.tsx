import { useStore } from "../store";
import { useI18n } from "../i18n/context";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { theme } from "../theme";
import * as storage from "../storage";

interface PatternDetailProps {
  id: string;
}

export function PatternDetail({ id }: PatternDetailProps) {
  const { t } = useI18n();
  const { patterns, designs, setView, deletePattern } = useStore();

  const pattern = patterns.find((p) => p.id === id);

  if (!pattern) {
    return <div>Pattern not found</div>;
  }

  const usedInDesigns = designs.filter((d) => d.linkedPatternIds.includes(id));

  const handleDelete = () => {
    if (window.confirm(t.common.confirmDelete)) {
      deletePattern(id);
      setView({ type: "patterns-list" });
    }
  };

  const handleOpenFile = async () => {
    if (pattern.attachedFile) {
      try {
        console.log("Opening file:", pattern.attachedFile.filePath);
        await storage.openFile(pattern.attachedFile.filePath);
      } catch (error) {
        console.error("Error opening file:", error);
        // Error will be caught by global error handler
        throw error;
      }
    } else {
      console.warn("No attached file to open");
    }
  };

  return (
    <div
      style={{
        padding: theme.spacing.xl,
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: theme.spacing.xl }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setView({ type: "patterns-list" })}
        >
          ← {t.common.back}
        </Button>
      </div>

      <div
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.xl,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadow.md,
          marginBottom: theme.spacing.lg,
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: theme.spacing.lg,
            fontSize: "2rem",
            fontWeight: "700",
          }}
        >
          {pattern.name}
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.lg,
          }}
        >
          <div>
            <strong style={{ color: theme.colors.textSecondary }}>
              {t.patterns.garmentType}:
            </strong>{" "}
            {t.garmentTypes[pattern.garmentType]}
          </div>
          <div>
            <strong style={{ color: theme.colors.textSecondary }}>
              {t.patterns.length}:
            </strong>{" "}
            {pattern.length ? t.lengthTypes[pattern.length] : t.common.none}
          </div>
          <div>
            <strong style={{ color: theme.colors.textSecondary }}>
              {t.patterns.sleeveLength}:
            </strong>{" "}
            {pattern.sleeveLength
              ? t.sleeveLengthTypes[pattern.sleeveLength]
              : t.common.none}
          </div>
          {pattern.collection && (
            <div>
              <strong style={{ color: theme.colors.textSecondary }}>
                {t.patterns.collection}:
              </strong>{" "}
              {pattern.collection}
            </div>
          )}
          <div>
            <strong style={{ color: theme.colors.textSecondary }}>
              {t.patterns.createdAt}:
            </strong>{" "}
            {new Date(pattern.createdAt).toLocaleDateString()}
          </div>
        </div>

        {pattern.description && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            <strong
              style={{
                color: theme.colors.textSecondary,
                display: "block",
                marginBottom: theme.spacing.sm,
              }}
            >
              {t.patterns.description}:
            </strong>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{pattern.description}</p>
          </div>
        )}

        {pattern.tags.length > 0 && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            <strong
              style={{
                color: theme.colors.textSecondary,
                display: "block",
                marginBottom: theme.spacing.sm,
              }}
            >
              {t.patterns.tags}:
            </strong>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: theme.spacing.xs,
              }}
            >
              {pattern.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          </div>
        )}

        {/* Attached File */}
        <div style={{ marginBottom: theme.spacing.lg }}>
          <strong
            style={{
              color: theme.colors.textSecondary,
              display: "block",
              marginBottom: theme.spacing.sm,
            }}
          >
            {t.patterns.attachedFile}:
          </strong>
          {pattern.attachedFile ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.md,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.primaryLight,
                borderRadius: theme.borderRadius.md,
              }}
            >
              <span>📎 PDF File</span>
              <Button size="sm" onClick={handleOpenFile}>
                {t.patterns.openFile}
              </Button>
            </div>
          ) : (
            <p style={{ color: theme.colors.textMuted }}>{t.patterns.noFile}</p>
          )}
        </div>

        <div style={{ display: "flex", gap: theme.spacing.sm }}>
          <Button onClick={() => setView({ type: "pattern-edit", id })}>
            {t.common.edit}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t.common.delete}
          </Button>
        </div>
      </div>

      {/* Used in Designs */}
      <div
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.xl,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadow.sm,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.5rem", fontWeight: "600" }}>
          {t.patterns.usedInDesigns}
        </h2>

        {usedInDesigns.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.md,
            }}
          >
            {usedInDesigns.map((design) => (
              <div
                key={design.id}
                style={{
                  padding: theme.spacing.lg,
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() =>
                  setView({ type: "design-detail", id: design.id })
                }
              >
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {design.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {t.garmentTypes[design.garmentType]} •{" "}
                    {design.length
                      ? t.lengthTypes[design.length]
                      : t.common.none}
                  </div>
                </div>
                <Button size="sm" variant="secondary">
                  {t.common.view}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: theme.colors.textMuted }}>
            {t.patterns.noDesigns}
          </p>
        )}
      </div>
    </div>
  );
}
