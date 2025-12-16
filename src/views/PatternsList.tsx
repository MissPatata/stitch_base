import { useState, useMemo } from "react";
import { useStore } from "../store";
import { useI18n } from "../i18n/context";
import { Button } from "../components/Button";
import { SearchBar } from "../components/SearchBar";
import { Tag } from "../components/Tag";
import { theme } from "../theme";
import type {
  Pattern,
  GarmentType,
  LengthType,
  SleeveLengthType,
} from "../types";

export function PatternsList() {
  const { t } = useI18n();
  const { patterns, setView, deletePattern } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGarmentType, setFilterGarmentType] = useState<GarmentType | "">(
    ""
  );
  const [filterLength, setFilterLength] = useState<LengthType | "">("");
  const [filterSleeveLength, setFilterSleeveLength] = useState<
    SleeveLengthType | ""
  >("");
  const [sortBy, setSortBy] = useState<string>("createdAt-desc");

  const filteredAndSortedPatterns = useMemo(() => {
    // Ensure patterns is always an array
    const patternsArray = Array.isArray(patterns) ? patterns : [];
    let result = [...patternsArray];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          p.collection?.toLowerCase().includes(query)
      );
    }

    // Filter by garment type
    if (filterGarmentType) {
      result = result.filter((p) => p.garmentType === filterGarmentType);
    }

    // Filter by length
    if (filterLength) {
      result = result.filter((p) => p.length === filterLength);
    } else {
      // If filter is empty, we show all (including null)
    }

    // Filter by sleeve length
    if (filterSleeveLength) {
      result = result.filter((p) => p.sleeveLength === filterSleeveLength);
    } else {
      // If filter is empty, we show all (including null)
    }

    // Sort
    const [field, order] = sortBy.split("-");
    result.sort((a, b) => {
      let aVal: any = a[field as keyof Pattern];
      let bVal: any = b[field as keyof Pattern];

      if (field === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    patterns,
    searchQuery,
    filterGarmentType,
    filterLength,
    filterSleeveLength,
    sortBy,
  ]);

  const handleDelete = (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      deletePattern(id);
    }
  };

  return (
    <div style={{ padding: theme.spacing.xl }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.xl,
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            margin: 0,
            color: theme.colors.textPrimary,
          }}
        >
          {t.patterns.title}
        </h1>
        <Button onClick={() => setView({ type: "pattern-edit" })}>
          + {t.patterns.newPattern}
        </Button>
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing.lg,
          boxShadow: theme.shadow.sm,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.spacing.md,
          alignItems: "center",
        }}
      >
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <select
          value={filterGarmentType}
          onChange={(e) =>
            setFilterGarmentType(e.target.value as GarmentType | "")
          }
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
          }}
        >
          <option value="">
            {t.filters.all} - {t.patterns.garmentType}
          </option>
          {Object.keys(t.garmentTypes).map((key) => (
            <option key={key} value={key}>
              {t.garmentTypes[key as GarmentType]}
            </option>
          ))}
        </select>

        <select
          value={filterLength}
          onChange={(e) => setFilterLength(e.target.value as LengthType | "")}
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
          }}
        >
          <option value="">
            {t.filters.all} - {t.patterns.length}
          </option>
          {Object.keys(t.lengthTypes).map((key) => (
            <option key={key} value={key}>
              {t.lengthTypes[key as LengthType]}
            </option>
          ))}
        </select>

        <select
          value={filterSleeveLength}
          onChange={(e) =>
            setFilterSleeveLength(e.target.value as SleeveLengthType | "")
          }
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
          }}
        >
          <option value="">
            {t.filters.all} - {t.patterns.sleeveLength}
          </option>
          {Object.keys(t.sleeveLengthTypes).map((key) => (
            <option key={key} value={key}>
              {t.sleeveLengthTypes[key as SleeveLengthType]}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            marginLeft: "auto",
          }}
        >
          <option value="createdAt-desc">
            {t.patterns.createdAt} (Newest)
          </option>
          <option value="createdAt-asc">{t.patterns.createdAt} (Oldest)</option>
          <option value="name-asc">{t.patterns.name} (A-Z)</option>
          <option value="name-desc">{t.patterns.name} (Z-A)</option>
        </select>
      </div>

      {/* Patterns Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: theme.spacing.lg,
        }}
      >
        {filteredAndSortedPatterns.map((pattern) => (
          <div
            key={pattern.id}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              boxShadow: theme.shadow.md,
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onClick={() => setView({ type: "pattern-detail", id: pattern.id })}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.sm,
                fontSize: "1.25rem",
                fontWeight: "600",
              }}
            >
              {pattern.name}
            </h3>

            <div
              style={{
                fontSize: "0.875rem",
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.sm,
              }}
            >
              {t.garmentTypes[pattern.garmentType]} •{" "}
              {pattern.length ? t.lengthTypes[pattern.length] : t.common.none}
            </div>

            {pattern.attachedFile && (
              <div
                style={{
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  backgroundColor: theme.colors.primaryLight,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: "0.75rem",
                  display: "inline-block",
                  marginBottom: theme.spacing.sm,
                }}
              >
                📎 PDF Attached
              </div>
            )}

            {pattern.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: theme.spacing.xs,
                  marginBottom: theme.spacing.md,
                }}
              >
                {pattern.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
                {pattern.tags.length > 3 && (
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: theme.colors.textMuted,
                    }}
                  >
                    +{pattern.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: theme.spacing.sm,
                marginTop: theme.spacing.md,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setView({ type: "pattern-edit", id: pattern.id })
                }
              >
                {t.common.edit}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(pattern.id)}
              >
                {t.common.delete}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedPatterns.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: theme.spacing["2xl"],
            color: theme.colors.textMuted,
          }}
        >
          No patterns found
        </div>
      )}
    </div>
  );
}
