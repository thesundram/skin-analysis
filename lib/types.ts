export interface WrinkleMeasurement {
  id: string
  label: string          // e.g. "Forehead line", "Crow's foot L"
  lengthMm: number       // estimated length in mm
  depthCategory: "surface" | "moderate" | "deep"
  // SVG viewBox 0-100 coordinates for the line overlay
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface PoreMeasurement {
  id: string
  label: string          // e.g. "Nose bridge pore"
  diameterUm: number     // estimated diameter in micrometres
  depthScore: number     // 0–100, higher = deeper
  depthCategory: "shallow" | "moderate" | "deep"
  x: number              // SVG viewBox 0-100 centre
  y: number
}

export interface SkinAnalysisResult {
  id: string
  timestamp: Date
  imageUrl: string
  scores: {
    acne: number
    pigmentation: number
    wrinkles: number
    oiliness: number
    redness: number
    hydration: number
    pores: number
    texture: number
  }
  overallScore: number
  skinType: "oily" | "dry" | "combination" | "normal" | "sensitive"
  concerns: SkinConcern[]
  recommendations: string[]
  annotations?: AnnotatedRegion[]
  wearingGlasses?: boolean
  glassesNote?: string
  isDemo?: boolean
  isLockedForDay?: boolean
  wrinkleMeasurements?: WrinkleMeasurement[]
  poreMeasurements?: PoreMeasurement[]
}

export interface SkinConcern {
  type: string
  severity: "mild" | "moderate" | "severe"
  description: string
  region?: string
}

export interface AnnotatedRegion {
  x: number
  y: number
  width: number
  height: number
  label: string
  severity: "mild" | "moderate" | "severe"
}

export interface HistoryEntry {
  id: string
  date: Date
  overallScore: number
  scores: SkinAnalysisResult["scores"]
}
