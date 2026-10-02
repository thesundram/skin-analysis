"use client"

import { FacialAnnotationViewer } from "@/components/skin-analysis/facial-annotation-viewer"
import { Header } from "@/components/skin-analysis/header"
import { Footer } from "@/components/skin-analysis/footer"
import { useImage } from "@/lib/context/image-context"
import { useEffect, useState } from "react"

export default function VisualizationPage() {
  const { currentImageUrl } = useImage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col justify-between bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-1">
        <FacialAnnotationViewer userImageUrl={currentImageUrl || undefined} />
      </div>
      <Footer />
    </main>
  )
}
