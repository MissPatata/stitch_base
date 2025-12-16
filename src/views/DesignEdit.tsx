import { useState } from "react";
import { nanoid } from "nanoid";
import { useStore } from "../store";
import { useI18n } from "../i18n/context";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { useImageUrl } from "../hooks/useImageUrl";
import { theme } from "../theme";
import * as storage from "../storage";
import type {
  Design,
  GarmentType,
  LengthType,
  SleeveLengthType,
  ProcessStatus,
  DesignImageType,
} from "../types";

interface DesignEditProps {
  id?: string;
}

function EditImageThumbnail({ imagePath }: { imagePath: string }) {
  const imageUrl = useImageUrl(imagePath);
  return (
    <img
      src={imageUrl}
      alt="Design"
      style={{
        width: "100%",
        height: "150px",
        objectFit: "cover",
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/placeholder.svg";
      }}
    />
  );
}

export function DesignEdit({ id }: DesignEditProps) {
  const { t } = useI18n();
  const { designs, patterns, setView, addDesign, updateDesign } = useStore();
  const isEditing = Boolean(id);
  const existingDesign = isEditing ? designs.find((d) => d.id === id) : null;

  // Use existing ID or generate a temporary one for new designs to allow image uploads
  const [designId] = useState(id || nanoid());

  const [name, setName] = useState(existingDesign?.name || "");
  const [garmentType, setGarmentType] = useState<GarmentType>(
    existingDesign?.garmentType || "t-shirt"
  );
  const [length, setLength] = useState<LengthType | null>(
    existingDesign?.length ?? null
  );
  const [sleeveLength, setSleeveLength] = useState<SleeveLengthType | null>(
    existingDesign?.sleeveLength ?? null
  );
  const [processStatus, setProcessStatus] = useState<ProcessStatus>(
    existingDesign?.processStatus || "idea"
  );
  const [collection, setCollection] = useState(
    existingDesign?.collection || ""
  );
  const [description, setDescription] = useState(
    existingDesign?.description || ""
  );
  const [tags, setTags] = useState<string[]>(existingDesign?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState(existingDesign?.images || []);
  const [linkedPatternIds, setLinkedPatternIds] = useState<string[]>(
    existingDesign?.linkedPatternIds || []
  );
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddImages = async () => {
    const files = await storage.selectImageFiles();
    if (files) {
      const newImages = await Promise.all(
        files.map((file) => storage.saveDesignImage(designId, file, "process"))
      );
      setImages([...images, ...newImages]);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (image) {
      await storage.removeDesignImage(image);
      setImages(images.filter((img) => img.id !== imageId));
    }
  };

  const handleChangeImageType = (imageId: string, type: DesignImageType) => {
    setImages(
      images.map((img) => (img.id === imageId ? { ...img, type } : img))
    );
  };

  const handleOpenLinkDialog = () => {
    setShowLinkDialog(true);
  };

  const togglePatternSelection = (patternId: string) => {
    setLinkedPatternIds((prev) =>
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    const designData: Design = {
      id: designId,
      name: name.trim(),
      garmentType,
      length,
      sleeveLength,
      processStatus,
      collection: collection.trim() || undefined,
      description: description.trim(),
      tags,
      images,
      linkedPatternIds,
      createdAt: existingDesign?.createdAt || new Date().toISOString(),
    };

    if (isEditing) {
      await updateDesign(designData.id, designData);
      setView({ type: "design-detail", id: designData.id });
    } else {
      await addDesign(designData);
      setView({ type: "design-detail", id: designData.id });
    }
  };

  return (
    <div
      style={{ padding: theme.spacing.xl, maxWidth: "800px", margin: "0 auto" }}
    >
      <div style={{ marginBottom: theme.spacing.xl }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            setView(
              isEditing
                ? { type: "design-detail", id: id! }
                : { type: "designs-list" }
            )
          }
        >
          ← {t.common.back}
        </Button>
      </div>

      <h1 style={{ marginBottom: theme.spacing.xl }}>
        {isEditing ? t.designs.editDesign : t.designs.newDesign}
      </h1>

      <div
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.xl,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadow.md,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.lg,
          }}
        >
          {/* Name */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: theme.spacing.sm,
                fontWeight: "600",
              }}
            >
              {t.designs.name} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Garment Type & Length */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: theme.spacing.md,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: theme.spacing.sm,
                  fontWeight: "600",
                }}
              >
                {t.designs.garmentType}
              </label>
              <select
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value as GarmentType)}
                style={{
                  width: "100%",
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "1rem",
                }}
              >
                {Object.keys(t.garmentTypes).map((key) => (
                  <option key={key} value={key}>
                    {t.garmentTypes[key as GarmentType]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: theme.spacing.sm,
                  fontWeight: "600",
                }}
              >
                {t.designs.length}
              </label>
              <select
                value={length || ""}
                onChange={(e) =>
                  setLength(
                    e.target.value ? (e.target.value as LengthType) : null
                  )
                }
                style={{
                  width: "100%",
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "1rem",
                }}
              >
                <option value="">{t.common.none}</option>
                {Object.keys(t.lengthTypes).map((key) => (
                  <option key={key} value={key}>
                    {t.lengthTypes[key as LengthType]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sleeve Length */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: theme.spacing.sm,
                fontWeight: "600",
              }}
            >
              {t.designs.sleeveLength}
            </label>
            <select
              value={sleeveLength || ""}
              onChange={(e) =>
                setSleeveLength(
                  e.target.value ? (e.target.value as SleeveLengthType) : null
                )
              }
              style={{
                width: "100%",
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                fontSize: "1rem",
              }}
            >
              <option value="">{t.common.none}</option>
              {Object.keys(t.sleeveLengthTypes).map((key) => (
                <option key={key} value={key}>
                  {t.sleeveLengthTypes[key as SleeveLengthType]}
                </option>
              ))}
            </select>
          </div>

          {/* Process Status & Collection */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: theme.spacing.md,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: theme.spacing.sm,
                  fontWeight: "600",
                }}
              >
                {t.designs.processStatus}
              </label>
              <select
                value={processStatus}
                onChange={(e) =>
                  setProcessStatus(e.target.value as ProcessStatus)
                }
                style={{
                  width: "100%",
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "1rem",
                }}
              >
                {Object.keys(t.processStatus).map((key) => (
                  <option key={key} value={key}>
                    {t.processStatus[key as ProcessStatus]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: theme.spacing.sm,
                  fontWeight: "600",
                }}
              >
                {t.designs.collection}
              </label>
              <input
                type="text"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: theme.spacing.sm,
                fontWeight: "600",
              }}
            >
              {t.designs.description}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: theme.spacing.sm,
                fontWeight: "600",
              }}
            >
              {t.designs.tags}
            </label>
            <div
              style={{
                display: "flex",
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
              }}
            >
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
                placeholder="Add tag..."
                style={{
                  flex: 1,
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "1rem",
                }}
              />
              <Button type="button" onClick={handleAddTag}>
                {t.common.add}
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: theme.spacing.xs,
              }}
            >
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  onRemove={() => handleRemoveTag(tag)}
                />
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <label style={{ fontWeight: "600" }}>{t.designs.images}</label>
              <Button type="button" size="sm" onClick={handleAddImages}>
                + {t.designs.addImages}
              </Button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: theme.spacing.md,
              }}
            >
              {images.map((image) => (
                <div
                  key={image.id}
                  style={{
                    position: "relative",
                    borderRadius: theme.borderRadius.md,
                    overflow: "hidden",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <EditImageThumbnail imagePath={image.filePath} />
                  <div
                    style={{
                      padding: theme.spacing.xs,
                      borderTop: `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.surface,
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.7rem",
                        fontWeight: "600",
                        color: theme.colors.textSecondary,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      {t.designs.imageType || "Type"}:
                    </label>
                    <select
                      value={image.type}
                      onChange={(e) =>
                        handleChangeImageType(
                          image.id,
                          e.target.value as DesignImageType
                        )
                      }
                      style={{
                        width: "100%",
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        fontSize: "0.75rem",
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.borderRadius.sm,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary,
                        cursor: "pointer",
                      }}
                    >
                      {Object.keys(t.imageTypes).map((key) => (
                        <option key={key} value={key}>
                          {t.imageTypes[key as DesignImageType]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    style={{
                      position: "absolute",
                      top: theme.spacing.xs,
                      right: theme.spacing.xs,
                      backgroundColor: "rgba(255, 181, 181, 0.9)",
                      color: theme.colors.textPrimary,
                      border: "none",
                      borderRadius: theme.borderRadius.sm,
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      lineHeight: 1,
                    }}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Patterns */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <label style={{ fontWeight: "600" }}>
                {t.designs.linkedPatterns}
              </label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleOpenLinkDialog}
              >
                {t.designs.linkPatterns}
              </Button>
            </div>

            {linkedPatternIds.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.sm,
                }}
              >
                {patterns
                  .filter((p) => linkedPatternIds.includes(p.id))
                  .map((pattern) => (
                    <div
                      key={pattern.id}
                      style={{
                        padding: theme.spacing.md,
                        backgroundColor: theme.colors.surfaceHover,
                        borderRadius: theme.borderRadius.md,
                      }}
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

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: theme.spacing.sm,
              marginTop: theme.spacing.md,
            }}
          >
            <Button onClick={handleSave}>{t.common.save}</Button>
            <Button
              variant="secondary"
              onClick={() =>
                setView(
                  isEditing
                    ? { type: "design-detail", id: id! }
                    : { type: "designs-list" }
                )
              }
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </div>

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

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.lg,
              }}
            >
              {patterns.map((pattern) => (
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
                    checked={linkedPatternIds.includes(pattern.id)}
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
              <Button onClick={() => setShowLinkDialog(false)}>
                {t.common.save}
              </Button>
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
