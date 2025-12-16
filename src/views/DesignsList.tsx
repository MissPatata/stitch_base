import { useState, useMemo } from "react";
import { useStore } from "../store";
import { useI18n } from "../i18n/context";
import { Button } from "../components/Button";
import { SearchBar } from "../components/SearchBar";
import { Tag } from "../components/Tag";
import { StatusPill } from "../components/StatusPill";
import { useImageUrl } from "../hooks/useImageUrl";
import { theme } from "../theme";
import type {
  Design,
  GarmentType,
  LengthType,
  SleeveLengthType,
  ProcessStatus,
} from "../types";

function ImagePreview({ imagePath, alt }: { imagePath: string; alt: string }) {
  const imageUrl = useImageUrl(imagePath);
  return (
    <div
      style={{
        width: "100%",
        height: "200px",
        backgroundColor: theme.colors.primaryLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          (e.target as HTMLImageElement).src = "/placeholder.svg";
        }}
      />
    </div>
  );
}

export function DesignsList() {
  const { t } = useI18n();
  const { designs, setView, deleteDesign } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGarmentType, setFilterGarmentType] = useState<GarmentType | "">(
    ""
  );
  const [filterLength, setFilterLength] = useState<LengthType | "">("");
  const [filterSleeveLength, setFilterSleeveLength] = useState<
    SleeveLengthType | ""
  >("");
  const [filterStatus, setFilterStatus] = useState<ProcessStatus | "">("");
  const [sortBy, setSortBy] = useState<string>("createdAt-desc");

  const filteredAndSortedDesigns = useMemo(() => {
    // Ensure designs is always an array
    const designsArray = Array.isArray(designs) ? designs : [];
    let result = [...designsArray];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          d.collection?.toLowerCase().includes(query)
      );
    }

    // Filter by garment type
    if (filterGarmentType) {
      result = result.filter((d) => d.garmentType === filterGarmentType);
    }

    // Filter by length
    if (filterLength) {
      result = result.filter((d) => d.length === filterLength);
    } else {
      // If filter is empty, we show all (including null)
    }

    // Filter by sleeve length
    if (filterSleeveLength) {
      result = result.filter((d) => d.sleeveLength === filterSleeveLength);
    } else {
      // If filter is empty, we show all (including null)
    }

    // Filter by status
    if (filterStatus) {
      result = result.filter((d) => d.processStatus === filterStatus);
    }

    // Sort
    const [field, order] = sortBy.split("-");
    result.sort((a, b) => {
      let aVal: any = a[field as keyof Design];
      let bVal: any = b[field as keyof Design];

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
    designs,
    searchQuery,
    filterGarmentType,
    filterLength,
    filterSleeveLength,
    filterStatus,
    sortBy,
  ]);

  const handleDelete = (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      deleteDesign(id);
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
          {t.designs.title}
        </h1>
        <Button onClick={() => setView({ type: "design-edit" })}>
          + {t.designs.newDesign}
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
            {t.filters.all} - {t.designs.garmentType}
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
            {t.filters.all} - {t.designs.length}
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
            {t.filters.all} - {t.designs.sleeveLength}
          </option>
          {Object.keys(t.sleeveLengthTypes).map((key) => (
            <option key={key} value={key}>
              {t.sleeveLengthTypes[key as SleeveLengthType]}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as ProcessStatus | "")
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
            {t.filters.all} - {t.designs.processStatus}
          </option>
          {Object.keys(t.processStatus).map((key) => (
            <option key={key} value={key}>
              {t.processStatus[key as ProcessStatus]}
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
          <option value="createdAt-desc">{t.designs.createdAt} (Newest)</option>
          <option value="createdAt-asc">{t.designs.createdAt} (Oldest)</option>
          <option value="name-asc">{t.designs.name} (A-Z)</option>
          <option value="name-desc">{t.designs.name} (Z-A)</option>
        </select>
      </div>

      {/* Designs Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: theme.spacing.lg,
        }}
      >
        {filteredAndSortedDesigns.map((design) => {
          const previewImage =
            design.images.find((img) => img.type === "preview") ||
            design.images[0];

          return (
            <div
              key={design.id}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                overflow: "hidden",
                boxShadow: theme.shadow.md,
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onClick={() => setView({ type: "design-detail", id: design.id })}
            >
              {previewImage && (
                <ImagePreview
                  imagePath={previewImage.filePath}
                  alt={design.name}
                />
              )}

              <div style={{ padding: theme.spacing.lg }}>
                <h3
                  style={{
                    margin: 0,
                    marginBottom: theme.spacing.sm,
                    fontSize: "1.25rem",
                    fontWeight: "600",
                  }}
                >
                  {design.name}
                </h3>

                <div style={{ marginBottom: theme.spacing.sm }}>
                  <StatusPill status={design.processStatus} />
                </div>

                <div
                  style={{
                    fontSize: "0.875rem",
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {t.garmentTypes[design.garmentType]} •{" "}
                  {design.length ? t.lengthTypes[design.length] : t.common.none}
                </div>

                {design.tags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: theme.spacing.xs,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    {design.tags.slice(0, 3).map((tag) => (
                      <Tag key={tag} label={tag} />
                    ))}
                    {design.tags.length > 3 && (
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: theme.colors.textMuted,
                        }}
                      >
                        +{design.tags.length - 3}
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
                      setView({ type: "design-edit", id: design.id })
                    }
                  >
                    {t.common.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(design.id)}
                  >
                    {t.common.delete}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAndSortedDesigns.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: theme.spacing["2xl"],
            color: theme.colors.textMuted,
          }}
        >
          No designs found
        </div>
      )}
    </div>
  );
}
