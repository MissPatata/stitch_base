import { useState } from "react";
import { nanoid } from "nanoid";
import { useStore } from "../store";
import { useI18n } from "../i18n/context";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { ImageGallery } from "../components/ImageGallery";
import { theme } from "../theme";
import * as storage from "../storage";
import type {
  Pattern,
  PatternImage,
  GarmentType,
  LengthType,
  SleeveLengthType,
  ImageType,
} from "../types";

interface PatternEditProps {
  id?: string;
}

export function PatternEdit({ id }: PatternEditProps) {
  const { t } = useI18n();
  const { patterns, setView, addPattern, updatePattern } = useStore();
  const isEditing = Boolean(id);
  const existingPattern = isEditing ? patterns.find((p) => p.id === id) : null;

  // Use existing ID or generate a temporary one for new patterns to allow file uploads
  const [patternId] = useState(id || nanoid());

  const [name, setName] = useState(existingPattern?.name || "");
  const [garmentType, setGarmentType] = useState<GarmentType>(
    existingPattern?.garmentType || "t-shirt"
  );
  const [length, setLength] = useState<LengthType | null>(
    existingPattern?.length ?? null
  );
  const [sleeveLength, setSleeveLength] = useState<SleeveLengthType | null>(
    existingPattern?.sleeveLength ?? null
  );
  const [collection, setCollection] = useState(
    existingPattern?.collection || ""
  );
  const [description, setDescription] = useState(
    existingPattern?.description || ""
  );
  const [tags, setTags] = useState<string[]>(existingPattern?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [attachedFile, setAttachedFile] = useState(
    existingPattern?.attachedFile
  );
  const [images, setImages] = useState<PatternImage[]>(
    existingPattern?.images ?? []
  );

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUploadFile = async () => {
    const file = await storage.selectPDFFile();
    if (file) {
      const newFile = await storage.savePatternFile(patternId, file);
      setAttachedFile(newFile);
    }
  };

  const handleRemoveFile = async () => {
    if (attachedFile) {
      await storage.removePatternFile(attachedFile);
      setAttachedFile(undefined);
    }
  };

  const handleAddImages = async () => {
    const files = await storage.selectImageFiles();
    if (files) {
      const newImages = await Promise.all(
        files.map((file) =>
          storage.savePatternImage(patternId, file, "process")
        )
      );
      setImages([...images, ...newImages]);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (image) {
      await storage.removePatternImage(image);
      setImages(images.filter((img) => img.id !== imageId));
    }
  };

  const handleChangeImageType = (imageId: string, type: ImageType) => {
    setImages(
      images.map((img) => (img.id === imageId ? { ...img, type } : img))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    const patternData: Pattern = {
      id: patternId,
      name: name.trim(),
      garmentType,
      length,
      sleeveLength,
      collection: collection.trim() || undefined,
      description: description.trim(),
      tags,
      attachedFile,
      images,
      createdAt: existingPattern?.createdAt || new Date().toISOString(),
    };

    if (isEditing) {
      await updatePattern(patternData.id, patternData);
      setView({ type: "pattern-detail", id: patternData.id });
    } else {
      await addPattern(patternData);
      setView({ type: "pattern-detail", id: patternData.id });
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
                ? { type: "pattern-detail", id: id! }
                : { type: "patterns-list" }
            )
          }
        >
          ← {t.common.back}
        </Button>
      </div>

      <h1 style={{ marginBottom: theme.spacing.xl }}>
        {isEditing ? t.patterns.editPattern : t.patterns.newPattern}
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
              {t.patterns.name} *
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
                {t.patterns.garmentType}
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
                {t.patterns.length}
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
              {t.patterns.sleeveLength}
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

          {/* Collection */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: theme.spacing.sm,
                fontWeight: "600",
              }}
            >
              {t.patterns.collection}
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

          {/* Description */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: theme.spacing.sm,
                fontWeight: "600",
              }}
            >
              {t.patterns.description}
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
              {t.patterns.tags}
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
          <ImageGallery
            images={images}
            onAddImages={handleAddImages}
            onRemoveImage={handleRemoveImage}
            onChangeImageType={handleChangeImageType}
            imageTypeLabel={t.patterns.images}
            addButtonLabel={t.patterns.addImages}
            emptyMessage={t.patterns.noImages}
          />

          {/* File Upload */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: theme.spacing.sm,
                fontWeight: "600",
              }}
            >
              {t.patterns.attachedFile}
            </label>
            {attachedFile ? (
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
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={handleRemoveFile}
                >
                  {t.common.delete}
                </Button>
              </div>
            ) : (
              <Button type="button" onClick={handleUploadFile}>
                {t.patterns.uploadFile}
              </Button>
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
                    ? { type: "pattern-detail", id: id! }
                    : { type: "patterns-list" }
                )
              }
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
