"use client"

import { useState, useCallback, useEffect } from "react"
import { useImage } from "@/lib/context/image-context"
import { ImageCapture } from "./image-capture"
import { AnalysisResults } from "./analysis-results"
import { AnalysisHistory } from "./analysis-history"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import type { SkinAnalysisResult, HistoryEntry } from "@/lib/types"
import { Camera, History, RotateCcw, Download, Share2 } from "lucide-react"

const STORAGE_KEY = "skinai-history"

export function SkinAnalyzer() {
  const { setCurrentImageUrl, setCurrentAnalysisResult } = useImage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<SkinAnalysisResult | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [activeTab, setActiveTab] = useState("analyze")

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setHistory(parsed.map((entry: HistoryEntry) => ({
          ...entry,
          date: new Date(entry.date)
        })))
      }
    } catch (error) {
      console.error("Failed to load history:", error)
    }
  }, [])

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: HistoryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
    } catch (error) {
      console.error("Failed to save history:", error)
    }
  }, [])

  const handleAnalyze = useCallback(async (imageData: string) => {
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/analyze-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis failed")
      }

      const analysisResult: SkinAnalysisResult = await response.json()
      analysisResult.timestamp = new Date(analysisResult.timestamp)

      setResult(analysisResult)
      setCurrentImageUrl(analysisResult.imageUrl)
      setCurrentAnalysisResult(analysisResult)

      // Add to history
      const historyEntry: HistoryEntry = {
        id: analysisResult.id,
        date: analysisResult.timestamp,
        overallScore: analysisResult.overallScore,
        scores: analysisResult.scores,
      }
      
      const newHistory = [...history, historyEntry].slice(-5) // Keep last 5 entries
      setHistory(newHistory)
      saveHistory(newHistory)
      
      toast.success("Analysis complete!", {
        description: `Your skin health score is ${analysisResult.overallScore}/100`,
      })
      
      setActiveTab("results")
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Please try again with a clearer photo",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [history, saveHistory])

  const handleNewAnalysis = () => {
    setResult(null)
    setActiveTab("analyze")
  }

  const handleExportResults = () => {
    if (!result) return
    
    const exportData = {
      analysisDate: result.timestamp,
      overallScore: result.overallScore,
      skinType: result.skinType,
      scores: result.scores,
      concerns: result.concerns,
      recommendations: result.recommendations,
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `skin-analysis-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success("Results exported!")
  }

  const handleShare = async () => {
    if (!result) return
    
    const shareText = `My SkinAI Analysis Results:
Overall Score: ${result.overallScore}/100
Skin Type: ${result.skinType}
Top Recommendation: ${result.recommendations[0]}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My SkinAI Analysis",
          text: shareText,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      toast.success("Copied to clipboard!")
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="analyze" className="gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze</span>
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!result} className="gap-2">
              <span className="relative flex h-2 w-2">
                {result && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {result && activeTab === "results" && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportResults}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleNewAnalysis}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="analyze" className="mt-0">
          <ImageCapture 
            onImageCapture={handleAnalyze} 
            isAnalyzing={isAnalyzing} 
          />
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          {result ? (
            <AnalysisResults result={result} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Complete an analysis to see your results</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <AnalysisHistory history={history} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
