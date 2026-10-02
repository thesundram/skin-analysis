"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts"
import type { SkinAnalysisResult } from "@/lib/types"
import { AlertCircle, CheckCircle2, Droplets, Sun, Wind, Sparkles, Glasses, EyeOff, Lock, Eye } from "lucide-react"
import Link from "next/link"

interface AnalysisResultsProps {
  result: SkinAnalysisResult
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-success"
  if (score >= 60) return "text-chart-4"
  if (score >= 40) return "text-warning"
  return "text-destructive"
}

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Fair"
  return "Needs Attention"
}

const getSeverityColor = (severity: "mild" | "moderate" | "severe") => {
  switch (severity) {
    case "mild": return "bg-chart-4/10 text-chart-4 border-chart-4/20"
    case "moderate": return "bg-warning/10 text-warning border-warning/20"
    case "severe": return "bg-destructive/10 text-destructive border-destructive/20"
  }
}

const skinTypeIcons = {
  oily: Wind,
  dry: Sun,
  combination: Droplets,
  normal: CheckCircle2,
  sensitive: AlertCircle
}

const skinTypeDescriptions = {
  oily: "Your skin produces excess sebum, leading to shine and potential breakouts.",
  dry: "Your skin lacks moisture, which may cause tightness and flaking.",
  combination: "You have both oily and dry areas, typically oily in the T-zone.",
  normal: "Your skin is well-balanced with minimal concerns.",
  sensitive: "Your skin reacts easily to products and environmental factors."
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const SkinTypeIcon = skinTypeIcons[result.skinType]
  
  const radarData = [
    { metric: "Hydration", value: result.scores.hydration, fullMark: 100 },
    { metric: "Texture", value: result.scores.texture, fullMark: 100 },
    { metric: "Clarity", value: 100 - result.scores.acne, fullMark: 100 },
    { metric: "Evenness", value: 100 - result.scores.pigmentation, fullMark: 100 },
    { metric: "Firmness", value: 100 - result.scores.wrinkles, fullMark: 100 },
    { metric: "Pore Size", value: 100 - result.scores.pores, fullMark: 100 },
  ]

  const barData = [
    { name: "Acne", value: result.scores.acne, color: "var(--chart-3)" },
    { name: "Pigmentation", value: result.scores.pigmentation, color: "var(--chart-5)" },
    { name: "Wrinkles", value: result.scores.wrinkles, color: "var(--chart-2)" },
    { name: "Oiliness", value: result.scores.oiliness, color: "var(--chart-4)" },
    { name: "Redness", value: result.scores.redness, color: "var(--destructive)" },
    { name: "Pores", value: result.scores.pores, color: "var(--chart-1)" },
  ]

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center bg-card">
                <div className="text-center">
                  <div className={cn("text-4xl font-bold", getScoreColor(result.overallScore))}>
                    {result.overallScore}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Overall
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-2xl font-bold text-foreground">{getScoreLabel(result.overallScore)}</h3>
                <Badge variant="outline" className="capitalize">
                  {result.skinType} Skin
                </Badge>
                {result.wearingGlasses !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "flex items-center gap-1",
                      result.wearingGlasses 
                        ? "bg-warning/10 text-warning border-warning/20" 
                        : "bg-success/10 text-success border-success/20"
                    )}
                  >
                    {result.wearingGlasses ? (
                      <>
                        <Glasses className="w-3 h-3" />
                        Glasses Detected
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        No Glasses
                      </>
                    )}
                  </Badge>
                )}
                {result.isLockedForDay && (
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
                  >
                    <Lock className="w-3 h-3" />
                    Locked for Today
                  </Badge>
                )}
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <SkinTypeIcon className="w-5 h-5 mt-0.5 text-primary" />
                <p>{skinTypeDescriptions[result.skinType]}</p>
              </div>
              {result.glassesNote && (
                <p className="text-sm text-muted-foreground mt-2 italic">{result.glassesNote}</p>
              )}
              {result.isLockedForDay && (
                <p className="text-sm text-primary mt-1 italic">
                  Skin parameters are locked for today. Glasses detection updates in real-time with each photo.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="concerns">Concerns</TabsTrigger>
          <TabsTrigger value="recommendations">Care Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skin Health Profile</CardTitle>
                <CardDescription>Multi-dimensional analysis of your skin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                      />
                      <Radar
                        name="Skin Health"
                        dataKey="value"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Concern Levels</CardTitle>
                <CardDescription>Lower values indicate healthier skin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={80}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)"
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(result.scores).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-foreground">{key}</span>
                      <span className={cn("text-sm font-bold", getScoreColor(100 - value))}>
                        {value}%
                      </span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concerns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identified Concerns</CardTitle>
              <CardDescription>Areas that may need attention in your skincare routine</CardDescription>
            </CardHeader>
            <CardContent>
              {result.concerns.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  <p className="text-muted-foreground">No major concerns detected. Keep up the great skincare routine!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.concerns.map((concern, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <Badge 
                        variant="outline" 
                        className={cn("capitalize shrink-0", getSeverityColor(concern.severity))}
                      >
                        {concern.severity}
                      </Badge>
                      <div>
                        <h4 className="font-medium text-foreground">{concern.type}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{concern.description}</p>
                        {concern.region && (
                          <p className="text-xs text-muted-foreground mt-1">Region: {concern.region}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personalized Recommendations</CardTitle>
              <CardDescription>Tailored advice based on your skin analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-foreground">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visualization Link */}
      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Detailed Facial Analysis
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Interactive visualization with color-coded skin condition markers on your facial image
            </p>
          </div>
          <Link href="/analysis-visualization">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
              View Visualization
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
