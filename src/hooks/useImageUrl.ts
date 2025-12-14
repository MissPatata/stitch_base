import { useState, useEffect } from "react"
import * as storage from "../storage"

export function useImageUrl(filePath: string | undefined): string {
  const [url, setUrl] = useState<string>("/placeholder.svg")

  useEffect(() => {
    if (!filePath) {
      setUrl("/placeholder.svg")
      return
    }

    // If it's already a blob URL or absolute URL, use it directly
    if (filePath.startsWith("blob:") || filePath.startsWith("http://") || filePath.startsWith("https://") || filePath.startsWith("file://") || filePath.startsWith("local://")) {
      setUrl(filePath)
      return
    }

    // Convert relative path to proper URL
    storage.getFileUrl(filePath)
      .then((resolvedUrl) => {
        setUrl(resolvedUrl)
      })
      .catch((error) => {
        console.error("Error getting image URL:", error)
        setUrl("/placeholder.svg")
      })
  }, [filePath])

  return url
}
