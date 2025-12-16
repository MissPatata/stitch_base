import { useState, useEffect } from "react";
import { useStore } from "../store";
import { useI18n } from "../i18n/context";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { StatusPill } from "../components/StatusPill";
import { ImageGallery } from "../components/ImageGallery";
import { ImageThumbnail } from "../components/ImageThumbnail";
import { SearchBar } from "../components/SearchBar";
import { theme } from "../theme";
import * as storage from "../storage";
import type { ImageType } from "../types";
import { useImageUrl } from "../hooks/useImageUrl";

interface DesignDetailProps {
  id: string;
}

function Lightbox({
  imagePath,
  onClose,
}: {
  imagePath: string;
  onClose: () => void;
}) {
  const imageUrl = useImageUrl(imagePath);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        cursor: "pointer",
      }}
      onClick={onClose}
    >
      <img
        src={imageUrl}
        alt="Full size"
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/placeholder.svg";
        }}
      />
    </div>
  );
}

export function DesignDetail({ id }: DesignDetailProps) {
  const { t } = useI18n();
  const { designs, patterns, setView, deleteDesign, updateDesign } = useStore();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>([]);
  const [patternSearchQuery, setPatternSearchQuery] = useState("");
  const [showStoragePath, setShowStoragePath] = useState(false);
  const [storagePath, setStoragePath] = useState<string | null>(null);

  const design = designs.find((d) => d.id === id);

  // Load storage path on mount
  useEffect(() => {
    if (window.electronAPI && design) {
      window.electronAPI
        .getUserDataPath()
        .then((userDataPath) => {
          setStoragePath(`${userDataPath}/data/designs/${design.id}`);
        })
        .catch(console.error);
    } else {
      setStoragePath("Browser mode - files stored in browser storage");
    }
  }, [design, id]);

  if (!design) {
    return <div>Design not found</div>;
  }

  const linkedPatterns = patterns.filter((p) =>
    design.linkedPatternIds.includes(p.id)
  );
  const previewImage =
    design.images.find((img) => img.type === "preview") || design.images[0];

  const handleDelete = () => {
    if (window.confirm(t.common.confirmDelete)) {
      deleteDesign(id);
      setView({ type: "designs-list" });
    }
  };

  const handleAddImages = async () => {
    const files = await storage.selectImageFiles();
    if (files) {
      const newImages = await Promise.all(
        files.map((file) => storage.saveDesignImage(id, file, "process"))
      );
      await updateDesign(id, {
        images: [...design.images, ...newImages],
      });
    }
  };

  const handleOpenLinkDialog = () => {
    setSelectedPatternIds([...design.linkedPatternIds]);
    setPatternSearchQuery("");
    setShowLinkDialog(true);
  };

  const handleSaveLinks = async () => {
    await updateDesign(id, { linkedPatternIds: selectedPatternIds });
    setShowLinkDialog(false);
  };

  const handleToggleStoragePath = () => {
    setShowStoragePath(!showStoragePath);
  };

  const handleOpenStorageFolder = async () => {
    if (storagePath && window.electronAPI) {
      try {
        await storage.openPath(storagePath);
      } catch (error) {
        console.error("Error opening storage folder:", error);
      }
    }
  };

  const togglePatternSelection = (patternId: string) => {
    setSelectedPatternIds((prev) =>
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    );
  };

  return (
    <div
      style={{
        padding: theme.spacing.xl,
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: theme.spacing.xl }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setView({ type: "designs-list" })}
        >
          ← {t.common.back}
        </Button>
      </div>

      <div style={{ display: "flex", gap: theme.spacing.xl }}>
        {/* Main Content */}
        <div style={{ flex: 2 }}>
          {/* Main Image */}
          {previewImage && (
            <div
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                overflow: "hidden",
                marginBottom: theme.spacing.lg,
                boxShadow: theme.shadow.md,
              }}
            >
              <ImageThumbnail
                imagePath={previewImage.filePath}
                alt={design.name}
                height="400px"
                onClick={() => setLightboxImage(previewImage.filePath)}
              />
            </div>
          )}

          {/* Image Gallery */}
          <div
            style={{
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadow.sm,
            }}
          >
            <ImageGallery
              images={design.images}
              onAddImages={handleAddImages}
              onRemoveImage={async (imageId: string) => {
                const image = design.images.find((img) => img.id === imageId);
                if (image) {
                  await storage.removeDesignImage(image);
                  await updateDesign(id, {
                    images: design.images.filter((img) => img.id !== imageId),
                  });
                }
              }}
              onChangeImageType={(imageId: string, type: ImageType) => {
                const updatedImages = design.images.map((img) =>
                  img.id === imageId ? { ...img, type } : img
                );
                updateDesign(id, { images: updatedImages });
              }}
              onImageClick={(imagePath) => setLightboxImage(imagePath)}
              imageTypeLabel={t.designs.images}
              addButtonLabel={t.designs.addImages}
              emptyMessage={t.designs.noImages}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadow.md,
              marginBottom: theme.spacing.lg,
            }}
          >
            <h1
              style={{
                margin: 0,
                marginBottom: theme.spacing.md,
                fontSize: "2rem",
                fontWeight: "700",
              }}
            >
              {design.name}
            </h1>

            <div style={{ marginBottom: theme.spacing.md }}>
              <StatusPill status={design.processStatus} />
            </div>

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
                  {t.designs.garmentType}:
                </strong>{" "}
                {t.garmentTypes[design.garmentType]}
              </div>
              <div>
                <strong style={{ color: theme.colors.textSecondary }}>
                  {t.designs.length}:
                </strong>{" "}
                {design.length ? t.lengthTypes[design.length] : t.common.none}
              </div>
              <div>
                <strong style={{ color: theme.colors.textSecondary }}>
                  {t.designs.sleeveLength}:
                </strong>{" "}
                {design.sleeveLength
                  ? t.sleeveLengthTypes[design.sleeveLength]
                  : t.common.none}
              </div>
              {design.collection && (
                <div>
                  <strong style={{ color: theme.colors.textSecondary }}>
                    {t.designs.collection}:
                  </strong>{" "}
                  {design.collection}
                </div>
              )}
              <div>
                <strong style={{ color: theme.colors.textSecondary }}>
                  {t.designs.createdAt}:
                </strong>{" "}
                {new Date(design.createdAt).toLocaleDateString()}
              </div>
            </div>

            {design.description && (
              <div style={{ marginBottom: theme.spacing.lg }}>
                <strong
                  style={{
                    color: theme.colors.textSecondary,
                    display: "block",
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {t.designs.description}:
                </strong>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  {design.description}
                </p>
              </div>
            )}

            {design.tags.length > 0 && (
              <div style={{ marginBottom: theme.spacing.lg }}>
                <strong
                  style={{
                    color: theme.colors.textSecondary,
                    display: "block",
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {t.designs.tags}:
                </strong>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: theme.spacing.xs,
                  }}
                >
                  {design.tags.map((tag) => (
                    <Tag key={tag} label={tag} />
                  ))}
                </div>
              </div>
            )}

            {/* Storage Location */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: theme.spacing.xs,
                }}
              >
                <strong
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: "0.875rem",
                  }}
                >
                  {t.common.storageLocation || "Storage Location"}:
                </strong>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleToggleStoragePath}
                >
                  {showStoragePath
                    ? t.common.hide || "Hide"
                    : t.common.show || "Show"}
                </Button>
              </div>
              {showStoragePath && storagePath && (
                <div
                  style={{
                    padding: theme.spacing.sm,
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: theme.borderRadius.md,
                    fontSize: "0.75rem",
                    wordBreak: "break-all",
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {storagePath}
                </div>
              )}
              {showStoragePath && storagePath && window.electronAPI && (
                <div style={{ width: "100%" }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleOpenStorageFolder}
                  >
                    {t.common.openFolder || "Open Folder"}
                  </Button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: theme.spacing.sm }}>
              <Button onClick={() => setView({ type: "design-edit", id })}>
                {t.common.edit}
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                {t.common.delete}
              </Button>
            </div>
          </div>

          {/* Linked Patterns */}
          <div
            style={{
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadow.sm,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <h3
                style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600" }}
              >
                {t.designs.linkedPatterns}
              </h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleOpenLinkDialog}
              >
                {t.designs.linkPatterns}
              </Button>
            </div>

            {linkedPatterns.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.sm,
                }}
              >
                {linkedPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    style={{
                      padding: theme.spacing.md,
                      backgroundColor: theme.colors.surfaceHover,
                      borderRadius: theme.borderRadius.md,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setView({ type: "pattern-detail", id: pattern.id })
                    }
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      {pattern.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {t.garmentTypes[pattern.garmentType]} •{" "}
                      {pattern.length
                        ? t.lengthTypes[pattern.length]
                        : t.common.none}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: theme.colors.textMuted }}>
                {t.designs.noLinkedPatterns}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox
          imagePath={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* Link Patterns Dialog */}
      {showLinkDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowLinkDialog(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.xl,
              borderRadius: theme.borderRadius.lg,
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>{t.designs.linkPatterns}</h2>

            <div style={{ marginBottom: theme.spacing.md }}>
              <SearchBar
                value={patternSearchQuery}
                onChange={setPatternSearchQuery}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.lg,
              }}
            >
              {patterns
                .filter((pattern) => {
                  if (!patternSearchQuery) return true;
                  const query = patternSearchQuery.toLowerCase();
                  return (
                    pattern.name.toLowerCase().includes(query) ||
                    pattern.tags.some((tag) =>
                      tag.toLowerCase().includes(query)
                    ) ||
                    pattern.collection?.toLowerCase().includes(query)
                  );
                })
                .map((pattern) => (
                  <label
                    key={pattern.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.md,
                      padding: theme.spacing.md,
                      backgroundColor: theme.colors.surfaceHover,
                      borderRadius: theme.borderRadius.md,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPatternIds.includes(pattern.id)}
                      onChange={() => togglePatternSelection(pattern.id)}
                    />
                    <div>
                      <div style={{ fontWeight: "600" }}>{pattern.name}</div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {t.garmentTypes[pattern.garmentType]} •{" "}
                        {pattern.length
                          ? t.lengthTypes[pattern.length]
                          : t.common.none}
                      </div>
                    </div>
                  </label>
                ))}
            </div>

            <div style={{ display: "flex", gap: theme.spacing.sm }}>
              <Button onClick={handleSaveLinks}>{t.common.save}</Button>
              <Button
                variant="secondary"
                onClick={() => setShowLinkDialog(false)}
              >
                {t.common.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
