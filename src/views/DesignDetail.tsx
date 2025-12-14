import { useState, useEffect } from "react"
import { useStore } from "../store"
import { useI18n } from "../i18n/context"
import { Button } from "../components/Button"
import { Tag } from "../components/Tag"
import { StatusPill } from "../components/StatusPill"
import { useImageUrl } from "../hooks/useImageUrl"
import { theme } from "../theme"
import * as storage from "../storage"
import type { DesignImageType } from "../types"

interface DesignDetailProps {
  id: string
}

function PreviewImage({ imagePath, alt, onClick }: { imagePath: string; alt: string; onClick: () => void }) {
  const imageUrl = useImageUrl(imagePath)
  return (
    <img
      src={imageUrl}
      alt={alt}
      style={{
        width: "100%",
        height: "400px",
        objectFit: "cover",
        cursor: "pointer",
      }}
      onClick={onClick}
      onError={(e) => {
        ;(e.target as HTMLImageElement).src = "/placeholder.svg"
      }}
    />
  )
}

function Lightbox({ imagePath, onClose }: { imagePath: string; onClose: () => void }) {
  const imageUrl = useImageUrl(imagePath)
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
          ;(e.target as HTMLImageElement).src = "/placeholder.svg"
        }}
      />
    </div>
  )
}

export function DesignDetail({ id }: DesignDetailProps) {
  const { t } = useI18n()
  const { designs, patterns, setView, deleteDesign, updateDesign } = useStore()
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>([])
  const [showStoragePath, setShowStoragePath] = useState(false)
  const [storagePath, setStoragePath] = useState<string | null>(null)

  // Load storage path on mount
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getUserDataPath().then((userDataPath) => {
        setStoragePath(`${userDataPath}/data`)
      }).catch(console.error)
    } else {
      setStoragePath("Browser mode - files stored in browser storage")
    }
  }, [])

  const design = designs.find((d) => d.id === id)

  if (!design) {
    return <div>Design not found</div>
  }

  const linkedPatterns = patterns.filter((p) => design.linkedPatternIds.includes(p.id))
  const previewImage = design.images.find((img) => img.type === "preview") || design.images[0]

  const handleDelete = () => {
    if (window.confirm(t.common.confirmDelete)) {
      deleteDesign(id)
      setView({ type: "designs-list" })
    }
  }

  const handleAddImages = async () => {
    const files = await storage.selectImageFiles()
    if (files) {
      const newImages = await Promise.all(files.map((file) => storage.saveDesignImage(id, file, "process")))
      await updateDesign(id, {
        images: [...design.images, ...newImages],
      })
    }
  }

  const handleOpenLinkDialog = () => {
    setSelectedPatternIds([...design.linkedPatternIds])
    setShowLinkDialog(true)
  }

  const handleSaveLinks = async () => {
    await updateDesign(id, { linkedPatternIds: selectedPatternIds })
    setShowLinkDialog(false)
  }

  const handleToggleStoragePath = () => {
    setShowStoragePath(!showStoragePath)
  }

  const handleOpenStorageFolder = async () => {
    if (storagePath && window.electronAPI) {
      try {
        await storage.openPath(storagePath)
      } catch (error) {
        console.error("Error opening storage folder:", error)
      }
    }
  }

  const togglePatternSelection = (patternId: string) => {
    setSelectedPatternIds((prev) =>
      prev.includes(patternId) ? prev.filter((id) => id !== patternId) : [...prev, patternId],
    )
  }

  return (
    <div style={{ padding: theme.spacing.xl, maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: theme.spacing.xl }}>
        <Button variant="secondary" size="sm" onClick={() => setView({ type: "designs-list" })}>
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
              <PreviewImage imagePath={previewImage.filePath} alt={design.name} onClick={() => setLightboxImage(previewImage.filePath)} />
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>{t.designs.images}</h2>
              <Button size="sm" onClick={handleAddImages}>
                + {t.designs.addImages}
              </Button>
            </div>

            {design.images.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: theme.spacing.md,
                }}
              >
                {design.images.map((image) => {
                  const handleChangeType = (newType: DesignImageType) => {
                    const updatedImages = design.images.map((img) =>
                      img.id === image.id ? { ...img, type: newType } : img
                    )
                    updateDesign(id, { images: updatedImages })
                  }

                  const ImageThumbnail = ({ imagePath, alt }: { imagePath: string; alt: string }) => {
                    const imageUrl = useImageUrl(imagePath)
                    return (
                      <div
                        style={{
                          position: "relative",
                          cursor: "pointer",
                          borderRadius: theme.borderRadius.md,
                          overflow: "hidden",
                        }}
                        onClick={() => setLightboxImage(imagePath)}
                      >
                        <img
                          src={imageUrl}
                          alt={alt}
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                          }}
                        />
                      </div>
                    )
                  }
                  
                  return (
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
                      <ImageThumbnail imagePath={image.filePath} alt={t.imageTypes[image.type]} />
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
                          onChange={(e) => handleChangeType(e.target.value as DesignImageType)}
                          onClick={(e) => e.stopPropagation()}
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
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ color: theme.colors.textMuted }}>{t.designs.noImages}</p>
            )}
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
            <h1 style={{ margin: 0, marginBottom: theme.spacing.md, fontSize: "2rem", fontWeight: "700" }}>
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
                <strong style={{ color: theme.colors.textSecondary }}>{t.designs.garmentType}:</strong>{" "}
                {t.garmentTypes[design.garmentType]}
              </div>
              <div>
                <strong style={{ color: theme.colors.textSecondary }}>{t.designs.length}:</strong>{" "}
                {t.lengthTypes[design.length]}
              </div>
              {design.collection && (
                <div>
                  <strong style={{ color: theme.colors.textSecondary }}>{t.designs.collection}:</strong>{" "}
                  {design.collection}
                </div>
              )}
              <div>
                <strong style={{ color: theme.colors.textSecondary }}>{t.designs.createdAt}:</strong>{" "}
                {new Date(design.createdAt).toLocaleDateString()}
              </div>
            </div>

            {design.description && (
              <div style={{ marginBottom: theme.spacing.lg }}>
                <strong style={{ color: theme.colors.textSecondary, display: "block", marginBottom: theme.spacing.sm }}>
                  {t.designs.description}:
                </strong>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{design.description}</p>
              </div>
            )}

            {design.tags.length > 0 && (
              <div style={{ marginBottom: theme.spacing.lg }}>
                <strong style={{ color: theme.colors.textSecondary, display: "block", marginBottom: theme.spacing.sm }}>
                  {t.designs.tags}:
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.xs }}>
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
                <strong style={{ color: theme.colors.textSecondary, fontSize: "0.875rem" }}>
                  {t.common.storageLocation || "Storage Location"}:
                </strong>
                <Button size="sm" variant="secondary" onClick={handleToggleStoragePath}>
                  {showStoragePath ? t.common.hide || "Hide" : t.common.show || "Show"}
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
                  <Button size="sm" variant="secondary" onClick={handleOpenStorageFolder}>
                    {t.common.openFolder || "Open Folder"}
                  </Button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: theme.spacing.sm }}>
              <Button onClick={() => setView({ type: "design-edit", id })}>{t.common.edit}</Button>
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
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600" }}>{t.designs.linkedPatterns}</h3>
              <Button size="sm" variant="secondary" onClick={handleOpenLinkDialog}>
                {t.designs.linkPatterns}
              </Button>
            </div>

            {linkedPatterns.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
                {linkedPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    style={{
                      padding: theme.spacing.md,
                      backgroundColor: theme.colors.surfaceHover,
                      borderRadius: theme.borderRadius.md,
                      cursor: "pointer",
                    }}
                    onClick={() => setView({ type: "pattern-detail", id: pattern.id })}
                  >
                    <div style={{ fontWeight: "600", marginBottom: theme.spacing.xs }}>{pattern.name}</div>
                    <div style={{ fontSize: "0.875rem", color: theme.colors.textSecondary }}>
                      {t.garmentTypes[pattern.garmentType]} • {t.lengthTypes[pattern.length]}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: theme.colors.textMuted }}>{t.designs.noLinkedPatterns}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && <Lightbox imagePath={lightboxImage} onClose={() => setLightboxImage(null)} />}

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
                    checked={selectedPatternIds.includes(pattern.id)}
                    onChange={() => togglePatternSelection(pattern.id)}
                  />
                  <div>
                    <div style={{ fontWeight: "600" }}>{pattern.name}</div>
                    <div style={{ fontSize: "0.875rem", color: theme.colors.textSecondary }}>
                      {t.garmentTypes[pattern.garmentType]} • {t.lengthTypes[pattern.length]}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: theme.spacing.sm }}>
              <Button onClick={handleSaveLinks}>{t.common.save}</Button>
              <Button variant="secondary" onClick={() => setShowLinkDialog(false)}>
                {t.common.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
