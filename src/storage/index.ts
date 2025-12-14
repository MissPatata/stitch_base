import { nanoid } from "nanoid"
import type { Design, Pattern, DesignImage, PatternFile, DesignImageType } from "../types"

// Base directory for all data
const BASE_DATA_DIR = "./data"

// Helper to ensure we're using Node APIs (will be wired through Electron preload)
declare global {
  interface Window {
    electronAPI?: {
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string, encoding?: string) => Promise<void>
      copyFile: (source: string, dest: string) => Promise<void>
      deleteFile: (path: string) => Promise<void>
      deleteDirectory: (path: string) => Promise<void>
      ensureDir: (path: string) => Promise<void>
      showOpenDialog: (options: { properties: string[]; filters?: any[] }) => Promise<string[] | null>
      openPath: (path: string) => Promise<void>
      getFileUrl: (path: string) => Promise<string>
      getUserDataPath: () => Promise<string>
    }
  }
}

// Fallback implementations for development (using localStorage for demo)
const storageAPI = {
  async readFile(path: string): Promise<string> {
    if (window.electronAPI) {
      return window.electronAPI.readFile(path)
    }
    // Fallback to localStorage
    const data = localStorage.getItem(path)
    return data || "[]"
  },

  async writeFile(path: string, content: string, encoding?: string): Promise<void> {
    if (window.electronAPI) {
      return window.electronAPI.writeFile(path, content, encoding)
    }
    // Fallback to localStorage
    localStorage.setItem(path, content)
  },

  async copyFile(source: File, dest: string): Promise<string> {
    if (window.electronAPI) {
      // In Electron, read the file as array buffer and convert to base64
      // The File object doesn't have a path property in the renderer
      const arrayBuffer = await source.arrayBuffer()
      // Convert ArrayBuffer to base64
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)
      // Write the file content as base64
      await window.electronAPI.writeFile(dest, base64, 'base64')
      return dest
    }
    // Fallback: create blob URL
    return URL.createObjectURL(source)
  },

  async deleteFile(path: string): Promise<void> {
    if (window.electronAPI) {
      return window.electronAPI.deleteFile(path)
    }
    // Fallback: revoke blob URL if applicable
    if (path.startsWith("blob:")) {
      URL.revokeObjectURL(path)
    }
  },

  async deleteDirectory(path: string): Promise<void> {
    if (window.electronAPI) {
      return window.electronAPI.deleteDirectory(path)
    }
    // Fallback: no-op
  },

  async ensureDir(path: string): Promise<void> {
    if (window.electronAPI) {
      return window.electronAPI.ensureDir(path)
    }
    // Fallback: no-op
  },

  async showOpenDialog(options: { properties: string[]; filters?: any[] }): Promise<File[] | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input")
      input.type = "file"
      input.multiple = options.properties.includes("multiSelections")

      if (options.filters) {
        const acceptTypes = options.filters
          .flatMap((f) => f.extensions)
          .map((ext) => `.${ext}`)
          .join(",")
        input.accept = acceptTypes
      }

      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || [])
        resolve(files.length > 0 ? files : null)
      }

      input.click()
    })
  },

  async openPath(path: string): Promise<void> {
    if (window.electronAPI) {
      try {
        await window.electronAPI.openPath(path)
      } catch (error) {
        console.error("Error in openPath:", error)
        throw error
      }
      return
    }
    // Fallback: open blob URL in new tab
    window.open(path, "_blank")
  },
}

// Storage functions
export async function loadDesigns(): Promise<Design[]> {
  try {
    const data = await storageAPI.readFile(`${BASE_DATA_DIR}/designs.json`)
    if (!data || data === "null" || data.trim() === "") {
      return []
    }
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Error loading designs:", error)
    return []
  }
}

export async function saveDesigns(designs: Design[]): Promise<void> {
  await storageAPI.writeFile(`${BASE_DATA_DIR}/designs.json`, JSON.stringify(designs, null, 2))
}

export async function loadPatterns(): Promise<Pattern[]> {
  try {
    const data = await storageAPI.readFile(`${BASE_DATA_DIR}/patterns.json`)
    if (!data || data === "null" || data.trim() === "") {
      return []
    }
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Error loading patterns:", error)
    return []
  }
}

export async function savePatterns(patterns: Pattern[]): Promise<void> {
  await storageAPI.writeFile(`${BASE_DATA_DIR}/patterns.json`, JSON.stringify(patterns, null, 2))
}

export async function saveDesignImage(designId: string, file: File, type: DesignImageType): Promise<DesignImage> {
  const imageId = nanoid()
  const extension = file.name.split(".").pop()
  const fileName = `${nanoid()}-${file.name}`
  const relativePath = `designs/${designId}/${fileName}`
  const fullPath = `${BASE_DATA_DIR}/${relativePath}`

  await storageAPI.ensureDir(`${BASE_DATA_DIR}/designs/${designId}`)
  
  try {
    const result = await storageAPI.copyFile(file, fullPath)
    return {
      id: imageId,
      designId,
      type,
      filePath: window.electronAPI ? relativePath : result,
    }
  } catch (error) {
    console.error("Error saving design image:", error)
    throw error
  }
}

export async function removeDesignImage(image: DesignImage): Promise<void> {
  const fullPath = window.electronAPI ? `${BASE_DATA_DIR}/${image.filePath}` : image.filePath
  await storageAPI.deleteFile(fullPath)
}

export async function savePatternFile(patternId: string, file: File): Promise<PatternFile> {
  const fileId = nanoid()
  const fileName = `${nanoid()}-${file.name}`
  const relativePath = `patterns/${patternId}/${fileName}`
  const fullPath = `${BASE_DATA_DIR}/${relativePath}`

  await storageAPI.ensureDir(`${BASE_DATA_DIR}/patterns/${patternId}`)
  
  try {
    const result = await storageAPI.copyFile(file, fullPath)
    return {
      id: fileId,
      patternId,
      filePath: window.electronAPI ? relativePath : result,
    }
  } catch (error) {
    console.error("Error saving pattern file:", error)
    throw error
  }
}

export async function removePatternFile(patternFile: PatternFile): Promise<void> {
  const fullPath = window.electronAPI ? `${BASE_DATA_DIR}/${patternFile.filePath}` : patternFile.filePath
  await storageAPI.deleteFile(fullPath)
}

export async function deleteDesignFiles(designId: string): Promise<void> {
  await storageAPI.deleteDirectory(`${BASE_DATA_DIR}/designs/${designId}`)
}

export async function deletePatternFiles(patternId: string): Promise<void> {
  await storageAPI.deleteDirectory(`${BASE_DATA_DIR}/patterns/${patternId}`)
}

export async function selectImageFiles(): Promise<File[] | null> {
  return storageAPI.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "webp"] }],
  })
}

export async function selectPDFFile(): Promise<File | null> {
  const files = await storageAPI.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  })
  return files ? files[0] : null
}

export async function openFile(filePath: string): Promise<void> {
  if (!window.electronAPI) {
    // In browser, open blob URL
    window.open(filePath, "_blank")
    return
  }
  
  // filePath is already a relative path like "patterns/xxx/file.pdf"
  const fullPath = `${BASE_DATA_DIR}/${filePath}`
  try {
    await storageAPI.openPath(fullPath)
  } catch (error) {
    console.error("Error opening file:", error)
    throw error
  }
}

// Open a path in the file system (for opening folders)
export async function openPath(filePath: string): Promise<void> {
  if (!window.electronAPI) {
    // In browser, can't open folders
    console.warn("Cannot open folder in browser mode")
    return
  }
  
  try {
    await storageAPI.openPath(filePath)
  } catch (error) {
    console.error("Error opening path:", error)
    throw error
  }
}

// Get a URL that can be used in img src or similar
export async function getFileUrl(filePath: string): Promise<string> {
  if (window.electronAPI) {
    // In Electron, convert relative path to custom protocol URL
    // filePath is already relative like "designs/xxx/image.jpg"
    // We need to pass it with BASE_DATA_DIR prefix for the protocol handler
    const pathWithBase = `${BASE_DATA_DIR}/${filePath}`
    return await window.electronAPI.getFileUrl(pathWithBase)
  }
  // In browser, return as-is (blob URL)
  return filePath
}
