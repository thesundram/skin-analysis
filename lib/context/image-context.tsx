"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import type { SkinAnalysisResult } from "@/lib/types"

interface ImageContextType {
  currentImageUrl: string | null
  setCurrentImageUrl: (url: string | null) => void
  currentAnalysisResult: SkinAnalysisResult | null
  setCurrentAnalysisResult: (result: SkinAnalysisResult | null) => void
}

const ImageContext = createContext<ImageContextType | undefined>(undefined)

export function ImageProvider({ children }: { children: ReactNode }) {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<SkinAnalysisResult | null>(null)

  return (
    <ImageContext.Provider value={{ currentImageUrl, setCurrentImageUrl, currentAnalysisResult, setCurrentAnalysisResult }}>
      {children}
    </ImageContext.Provider>
  )
}

export function useImage() {
  const context = useContext(ImageContext)
  if (context === undefined) {
    throw new Error("useImage must be used within an ImageProvider")
  }
  return context
}
