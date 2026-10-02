"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
interface AuthUser {
  id: string
  email?: string | null
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ImageCapture } from "./image-capture"
import { AnalysisResults } from "./analysis-results"
import { AnalysisHistory } from "./analysis-history"
import { Header } from "./header"
import { Footer } from "./footer"
import { Camera, History, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import type { SkinAnalysisResult } from "@/lib/types"

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
}

interface DbAnalysis {
  id: string
  user_id: string
  timestamp: string
  image_url: string | null
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
  overall_score: number
  skin_type: string
  concerns: Array<{
    type: string
    severity: "mild" | "moderate" | "severe"
    description: string
    region: string | null
  }>
  recommendations: string[]
  wearing_glasses: boolean
  glasses_note: string | null
  is_demo: boolean
}

interface DailyCache {
  id: string
  user_id: string
  date_key: string
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
  skin_type: string
  concerns: Array<{
    type: string
    severity: "mild" | "moderate" | "severe"
    description: string
    region: string
  }>
  recommendations: string[]
  overall_score: number
}

interface HistoryEntry {
  id: string
  date: Date
  overallScore: number
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
  skinType: string
  wearingGlasses?: boolean
}

interface SkinAnalyzerWithAuthProps {
  user: AuthUser
  profile: Profile | null
  initialHistory: DbAnalysis[]
  initialDailyCache: DailyCache | null
}

function getTodayKey(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

function dbToHistoryEntry(db: DbAnalysis): HistoryEntry {
  return {
    id: db.id,
    date: new Date(db.timestamp),
    overallScore: db.overall_score,
    scores: db.scores,
    skinType: db.skin_type,
    wearingGlasses: db.wearing_glasses,
  }
}

export function SkinAnalyzerWithAuth({ 
  user, 
  profile, 
  initialHistory, 
  initialDailyCache 
}: SkinAnalyzerWithAuthProps) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<SkinAnalysisResult | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(
    initialHistory.map(dbToHistoryEntry)
  )
  const [activeTab, setActiveTab] = useState("analyze")
  const [dailyCache, setDailyCache] = useState<DailyCache | null>(initialDailyCache)

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Sign out error:", err)
    } finally {
      router.push("/auth/login")
      router.refresh()
    }
  }

  const handleDeleteHistoryEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/analysis/delete?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete history record")
      }
      setHistory((prev) => prev.filter((item) => item.id !== id))
      toast.success("Scan removed from history")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting record")
    }
  }

  const handleClearHistory = async () => {
    try {
      const res = await fetch(`/api/analysis/delete?all=true`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to clear history")
      }
      setHistory([])
      toast.success("All analysis history cleared")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error clearing history")
    }
  }

  const handleAnalyze = useCallback(async (imageData: string) => {
    setIsAnalyzing(true)
    
    try {
      // Prepare daily cache for API if exists
      const dailyCacheForApi = dailyCache ? {
        dateKey: dailyCache.date_key,
        scores: dailyCache.scores,
        skinType: dailyCache.skin_type,
        concerns: dailyCache.concerns,
        recommendations: dailyCache.recommendations,
        overallScore: dailyCache.overall_score,
      } : null

      const response = await fetch("/api/analyze-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageData,
          dailyAnalysisCache: dailyCacheForApi
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis failed")
      }

      const analysisResult: SkinAnalysisResult = await response.json()
      analysisResult.timestamp = new Date(analysisResult.timestamp)
      
      setResult(analysisResult)

      // Check if this is first analysis of the day
      const isFirstOfDay = !dailyCache || dailyCache.date_key !== getTodayKey()

      // Save to database
      const saveResponse = await fetch("/api/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: analysisResult,
          isFirstOfDay,
        }),
      })

      if (saveResponse.ok) {
        // Update local state
        if (isFirstOfDay) {
          setDailyCache({
            id: "",
            user_id: user.id,
            date_key: getTodayKey(),
            scores: analysisResult.scores,
            skin_type: analysisResult.skinType,
            concerns: analysisResult.concerns.map(c => ({
              type: c.type,
              severity: c.severity,
              description: c.description,
              region: c.region || ""
            })),
            recommendations: analysisResult.recommendations,
            overall_score: analysisResult.overallScore,
          })
        }

        // Add to history
        const historyEntry: HistoryEntry = {
          id: analysisResult.id,
          date: new Date(),
          overallScore: analysisResult.overallScore,
          scores: analysisResult.scores,
          skinType: analysisResult.skinType,
          wearingGlasses: analysisResult.wearingGlasses,
        }

        setHistory(prev => [historyEntry, ...prev].slice(0, 5))
        toast.success("Analysis saved to your profile!")
      }

      setActiveTab("results")
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error(error instanceof Error ? error.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }, [dailyCache, user.id])

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      <Header
        user={{
          id: user.id,
          email: user.email || "",
          fullName: profile?.full_name || undefined,
        }}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6 text-center max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Skin Health Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Capture or upload a facial scan for AI dermatological assessment and recommendations.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2" disabled={!result}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="mt-0">
            <Card className="max-w-2xl mx-auto shadow-md border">
              <CardContent className="pt-6">
                <ImageCapture onImageCapture={handleAnalyze} isAnalyzing={isAnalyzing} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            {result && <AnalysisResults result={result} />}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <AnalysisHistory
              history={history}
              onDeleteEntry={handleDeleteHistoryEntry}
              onClearHistory={handleClearHistory}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
