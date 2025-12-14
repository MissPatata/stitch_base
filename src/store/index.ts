import { create } from "zustand"
import type { Design, Pattern } from "../types"
import * as storage from "../storage"

type View =
  | { type: "designs-list" }
  | { type: "design-detail"; id: string }
  | { type: "design-edit"; id?: string }
  | { type: "patterns-list" }
  | { type: "pattern-detail"; id: string }
  | { type: "pattern-edit"; id?: string }

interface AppState {
  // Data
  designs: Design[]
  patterns: Pattern[]

  // Navigation
  currentView: View

  // Loading
  isLoading: boolean

  // Actions
  initialize: () => Promise<void>
  setView: (view: View) => void

  // Designs
  addDesign: (design: Design) => Promise<void>
  updateDesign: (id: string, design: Partial<Design>) => Promise<void>
  deleteDesign: (id: string) => Promise<void>

  // Patterns
  addPattern: (pattern: Pattern) => Promise<void>
  updatePattern: (id: string, pattern: Partial<Pattern>) => Promise<void>
  deletePattern: (id: string) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  designs: [],
  patterns: [],
  currentView: { type: "designs-list" },
  isLoading: false,

  initialize: async () => {
    set({ isLoading: true })
    try {
      const [designs, patterns] = await Promise.all([storage.loadDesigns(), storage.loadPatterns()])
      // Ensure we always have arrays, even if storage returns something unexpected
      set({ 
        designs: Array.isArray(designs) ? designs : [], 
        patterns: Array.isArray(patterns) ? patterns : [], 
        isLoading: false 
      })
    } catch (error) {
      console.error("Failed to initialize:", error)
      set({ designs: [], patterns: [], isLoading: false })
    }
  },

  setView: (view) => set({ currentView: view }),

  addDesign: async (design) => {
    const designs = [...get().designs, design]
    set({ designs })
    await storage.saveDesigns(designs)
  },

  updateDesign: async (id, updates) => {
    const designs = get().designs.map((d) => (d.id === id ? { ...d, ...updates } : d))
    set({ designs })
    await storage.saveDesigns(designs)
  },

  deleteDesign: async (id) => {
    const design = get().designs.find((d) => d.id === id)
    if (design) {
      // Delete images
      await Promise.all(design.images.map((img) => storage.removeDesignImage(img)))
      await storage.deleteDesignFiles(id)
    }
    const designs = get().designs.filter((d) => d.id !== id)
    set({ designs })
    await storage.saveDesigns(designs)
  },

  addPattern: async (pattern) => {
    const patterns = [...get().patterns, pattern]
    set({ patterns })
    await storage.savePatterns(patterns)
  },

  updatePattern: async (id, updates) => {
    const patterns = get().patterns.map((p) => (p.id === id ? { ...p, ...updates } : p))
    set({ patterns })
    await storage.savePatterns(patterns)
  },

  deletePattern: async (id) => {
    const pattern = get().patterns.find((p) => p.id === id)
    if (pattern?.attachedFile) {
      await storage.removePatternFile(pattern.attachedFile)
    }
    await storage.deletePatternFiles(id)

    // Remove from linked designs
    const designs = get().designs.map((d) => ({
      ...d,
      linkedPatternIds: d.linkedPatternIds.filter((pid) => pid !== id),
    }))
    set({ designs })
    await storage.saveDesigns(designs)

    const patterns = get().patterns.filter((p) => p.id !== id)
    set({ patterns })
    await storage.savePatterns(patterns)
  },
}))
