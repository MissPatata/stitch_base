import { useI18n } from "../i18n/context";
import { Button } from "./Button";
import { ImageThumbnail } from "./ImageThumbnail";
import { theme } from "../theme";
import type { Image, ImageType } from "../types";

interface ImageGalleryProps<T extends Image> {
  images: T[];
  onAddImages: () => void;
  onRemoveImage: (imageId: string) => void;
  onChangeImageType: (imageId: string, type: ImageType) => void;
  imageTypeLabel?: string;
  addButtonLabel?: string;
  emptyMessage?: string;
  onImageClick?: (imagePath: string) => void;
}

export function ImageGallery<T extends Image>({
  images,
  onAddImages,
  onRemoveImage,
  onChangeImageType,
  imageTypeLabel,
  addButtonLabel,
  emptyMessage,
  onImageClick,
}: ImageGalleryProps<T>) {
  const { t } = useI18n();

  return (
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
          {imageTypeLabel || t.designs.images}
        </label>
        <Button type="button" size="sm" onClick={onAddImages}>
          + {addButtonLabel || t.designs.addImages}
        </Button>
      </div>

      {images.length > 0 ? (
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
              <ImageThumbnail
                imagePath={image.filePath}
                onClick={
                  onImageClick ? () => onImageClick(image.filePath) : undefined
                }
              />
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
                    onChangeImageType(image.id, e.target.value as ImageType)
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
                      {t.imageTypes[key as ImageType]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => onRemoveImage(image.id)}
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
      ) : (
        <p style={{ color: theme.colors.textMuted }}>
          {emptyMessage || t.designs.noImages}
        </p>
      )}
    </div>
  );
}
