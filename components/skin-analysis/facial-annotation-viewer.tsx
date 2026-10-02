"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Ruler, Circle } from "lucide-react"
import { useImage } from "@/lib/context/image-context"
import type { SkinAnalysisResult, WrinkleMeasurement, PoreMeasurement } from "@/lib/types"

interface FacialAnnotationViewerProps {
  userImageUrl?: string
}

interface AnnotationPoint {
  id: string
  x: number
  y: number
  label: string
  color: string
  conditionId: string
}

// Anatomically-correct face region coordinates (SVG viewBox 0 0 100 100)
const FACE_REGIONS: Record<string, { x: number; y: number; label: string }[]> = {
  acne: [
    { x: 50,  y: 18, label: "Forehead" },
    { x: 38,  y: 18, label: "Forehead L" },
    { x: 62,  y: 18, label: "Forehead R" },
    { x: 33,  y: 52, label: "Left cheek" },
    { x: 67,  y: 52, label: "Right cheek" },
    { x: 44,  y: 76, label: "Chin L" },
    { x: 56,  y: 76, label: "Chin R" },
  ],
  redness: [
    { x: 33,  y: 50, label: "Left cheek" },
    { x: 67,  y: 50, label: "Right cheek" },
    { x: 50,  y: 42, label: "Nose bridge" },
    { x: 50,  y: 56, label: "Nose tip" },
  ],
  pigmentation: [
    { x: 27,  y: 32, label: "Left temple" },
    { x: 73,  y: 32, label: "Right temple" },
    { x: 32,  y: 55, label: "Left cheekbone" },
    { x: 68,  y: 55, label: "Right cheekbone" },
    { x: 50,  y: 68, label: "Upper lip" },
  ],
}

const CONDITION_META: Record<string, { name: string; color: string; description: string; areas: string[]; threshold: number; recommendations: string[] }> = {
  acne: {
    name: "Acne & Breakouts",
    color: "#EF4444",
    description: "Active breakouts and comedones detected across the face.",
    areas: ["Forehead", "Cheeks", "Chin"],
    threshold: 30,
    recommendations: [
      "Use salicylic acid or benzoyl peroxide cleansers",
      "Maintain a consistent skincare routine twice daily",
      "Avoid touching affected areas",
      "Consider professional extraction or laser treatment",
    ],
  },
  redness: {
    name: "Redness & Inflammation",
    color: "#F97316",
    description: "Inflamed areas and skin irritation detected.",
    areas: ["Cheeks", "Nose bridge", "Nose tip"],
    threshold: 30,
    recommendations: [
      "Use gentle, fragrance-free skincare products",
      "Apply centella asiatica or niacinamide serums",
      "Avoid harsh scrubs and hot water",
      "Use SPF 30+ daily to prevent further irritation",
    ],
  },
  pigmentation: {
    name: "Pigmentation & Dark Spots",
    color: "#92400E",
    description: "Uneven skin tone and hyperpigmentation detected.",
    areas: ["Temples", "Cheekbones", "Upper lip"],
    threshold: 35,
    recommendations: [
      "Use vitamin C serums for brightening",
      "Apply hydroquinone or kojic acid treatments",
      "Use strict SPF protection (SPF 50+)",
      "Consider laser or chemical peels for persistent spots",
    ],
  },
  wrinkles: {
    name: "Fine Lines & Wrinkles",
    color: "#7C3AED",
    description: "Expression lines and age-related creases detected.",
    areas: ["Eye area", "Forehead", "Nasolabial folds"],
    threshold: 35,
    recommendations: [
      "Use retinol or retinoid products nightly",
      "Apply hydrating serums and moisturizers",
      "Daily sunscreen application (SPF 30+)",
      "Consider Botox or dermal fillers for deeper lines",
    ],
  },
  pores: {
    name: "Enlarged Pores",
    color: "#2563EB",
    description: "Visible enlarged pores and oily zones detected.",
    areas: ["Nose", "T-zone", "Cheeks"],
    threshold: 35,
    recommendations: [
      "Use niacinamide to minimise pore appearance",
      "Regular exfoliation with AHAs or BHAs",
      "Clay masks for deep pore cleansing",
      "Consider HydraFacial or microneedling treatments",
    ],
  },
}

function scoreSeverity(score: number): "mild" | "moderate" | "severe" {
  if (score >= 70) return "mild"
  if (score >= 40) return "moderate"
  return "severe"
}

function pointsForScore(conditionId: string, score: number): AnnotationPoint[] {
  const meta = CONDITION_META[conditionId]
  const regions = FACE_REGIONS[conditionId] || []
  const severity = scoreSeverity(score)
  const count = severity === "mild" ? 2 : severity === "moderate" ? 4 : regions.length
  return regions.slice(0, count).map((r, idx) => ({
    id: `${conditionId}-${idx}`,
    x: r.x,
    y: r.y,
    label: r.label,
    color: meta.color,
    conditionId,
  }))
}

function buildAnnotations(result: SkinAnalysisResult): AnnotationPoint[] {
  const points: AnnotationPoint[] = []
  const { scores } = result
  const mapping = [
    { conditionId: "acne",         score: 100 - scores.acne },
    { conditionId: "redness",      score: 100 - scores.redness },
    { conditionId: "pigmentation", score: 100 - scores.pigmentation },
  ]
  for (const { conditionId, score } of mapping) {
    const meta = CONDITION_META[conditionId]
    if (score > meta.threshold) {
      points.push(...pointsForScore(conditionId, 100 - score))
    }
  }
  return points
}

const DEFAULT_ANNOTATIONS: AnnotationPoint[] = [
  { id: "acne-0",         x: 50, y: 18, label: "Forehead",       color: "#EF4444", conditionId: "acne" },
  { id: "acne-1",         x: 33, y: 52, label: "Left cheek",     color: "#EF4444", conditionId: "acne" },
  { id: "redness-0",      x: 67, y: 50, label: "Right cheek",    color: "#F97316", conditionId: "redness" },
  { id: "redness-1",      x: 50, y: 56, label: "Nose tip",       color: "#F97316", conditionId: "redness" },
  { id: "pigmentation-0", x: 27, y: 32, label: "Left temple",    color: "#92400E", conditionId: "pigmentation" },
]

// Depth category colors
const DEPTH_COLORS = {
  surface:  "#A78BFA",
  moderate: "#7C3AED",
  deep:     "#4C1D95",
  shallow:  "#93C5FD",
} as const

const PORE_DEPTH_COLORS = {
  shallow:  "#93C5FD",
  moderate: "#2563EB",
  deep:     "#1E3A8A",
} as const

export function FacialAnnotationViewer({ userImageUrl }: FacialAnnotationViewerProps) {
  const { currentImageUrl, currentAnalysisResult } = useImage()
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [displayImageUrl, setDisplayImageUrl]     = useState<string | null>(null)
  const [annotations, setAnnotations]             = useState<AnnotationPoint[]>(DEFAULT_ANNOTATIONS)
  const [wrinkles, setWrinkles]                   = useState<WrinkleMeasurement[]>([])
  const [pores, setPores]                         = useState<PoreMeasurement[]>([])

  useEffect(() => {
    setDisplayImageUrl(userImageUrl || currentImageUrl || null)
  }, [userImageUrl, currentImageUrl])

  useEffect(() => {
    if (currentAnalysisResult) {
      setAnnotations(buildAnnotations(currentAnalysisResult))
      setWrinkles(currentAnalysisResult.wrinkleMeasurements ?? [])
      setPores(currentAnalysisResult.poreMeasurements ?? [])
    }
  }, [currentAnalysisResult])

  const visibleDotAnnotations = selectedCondition
    ? annotations.filter((a) => a.conditionId === selectedCondition)
    : annotations

  const showWrinkles = !selectedCondition || selectedCondition === "wrinkles"
  const showPores    = !selectedCondition || selectedCondition === "pores"

  const presentConditionIds = [
    ...new Set(annotations.map((a) => a.conditionId)),
    ...(wrinkles.length > 0 ? ["wrinkles"] : []),
    ...(pores.length > 0 ? ["pores"] : []),
  ]

  const getScoreForId = (id: string) => {
    if (!currentAnalysisResult) return null
    const s = currentAnalysisResult.scores
    const map: Record<string, number> = {
      acne: s.acne, redness: s.redness, pigmentation: s.pigmentation,
      wrinkles: s.wrinkles, pores: s.pores,
    }
    return map[id] ?? null
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Facial Skin Analysis Visualization</CardTitle>
          <CardDescription>
            {currentAnalysisResult
              ? "Annotations, wrinkle lengths and pore depths are derived from your latest scan."
              : "Run a scan to see personalised condition markers, wrinkle measurements, and pore depths on your photo."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Image + SVG overlay ── */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative w-full rounded-xl overflow-hidden border-2 border-border bg-muted">
                <div className="relative w-full aspect-[3/4]">
                  <Image
                    src={displayImageUrl || "/skin-analysis-visualization.jpg"}
                    alt="Facial skin analysis"
                    fill
                    className="object-cover object-top"
                    quality={95}
                    priority
                    unoptimized={!!displayImageUrl?.startsWith("data:")}
                  />

                  {/* ── SVG overlay ── */}
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  >
                    {/* ── Wrinkle lines ── */}
                    {showWrinkles && wrinkles.map((w) => {
                      const col = DEPTH_COLORS[w.depthCategory] ?? "#7C3AED"
                      const isSelected = selectedCondition === "wrinkles"
                      const midX = (w.x1 + w.x2) / 2
                      const midY = (w.y1 + w.y2) / 2
                      return (
                        <g key={w.id}>
                          {/* Glow halo */}
                          <line
                            x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
                            stroke={col} strokeWidth={isSelected ? 2.0 : 1.4}
                            strokeLinecap="round" opacity={0.35}
                          />
                          {/* Main line */}
                          <line
                            x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
                            stroke={col} strokeWidth={isSelected ? 1.0 : 0.7}
                            strokeLinecap="round" opacity={isSelected ? 1 : 0.8}
                            strokeDasharray={w.depthCategory === "surface" ? "1.5 1" : undefined}
                          />
                          {/* End-cap dots */}
                          <circle cx={w.x1} cy={w.y1} r={0.8} fill={col} opacity={0.9} />
                          <circle cx={w.x2} cy={w.y2} r={0.8} fill={col} opacity={0.9} />
                          {/* Length label shown when selected */}
                          {isSelected && (
                            <>
                              <rect
                                x={midX - 5} y={midY - 3}
                                width={10} height={4.5} rx={1.2}
                                fill={col} opacity={0.88}
                              />
                              <text
                                x={midX} y={midY + 0.8}
                                fontSize="2.5" fill="white"
                                textAnchor="middle"
                                fontFamily="sans-serif" fontWeight="700"
                              >
                                {w.lengthMm} mm
                              </text>
                            </>
                          )}
                        </g>
                      )
                    })}

                    {/* ── Pore circles ── */}
                    {showPores && pores.map((p) => {
                      const col = PORE_DEPTH_COLORS[p.depthCategory] ?? "#2563EB"
                      const isSelected = selectedCondition === "pores"
                      // Scale SVG radius: 120µm → r=1.2, 400µm → r=3.5
                      const r = 1.2 + ((p.diameterUm - 120) / 280) * 2.3
                      return (
                        <g key={p.id}>
                          {/* Outer ring */}
                          <circle
                            cx={p.x} cy={p.y} r={r + 1.5}
                            fill="none" stroke={col}
                            strokeWidth={isSelected ? 0.7 : 0.4}
                            opacity={isSelected ? 0.7 : 0.4}
                          />
                          {/* Inner filled circle */}
                          <circle
                            cx={p.x} cy={p.y} r={r}
                            fill={col} opacity={isSelected ? 0.9 : 0.65}
                          />
                          {/* Centre pip */}
                          <circle cx={p.x} cy={p.y} r={0.5} fill="white" opacity={0.9} />
                          {/* Diameter label when selected */}
                          {isSelected && (
                            <>
                              <rect
                                x={p.x + r + 1} y={p.y - 2.5}
                                width={11} height={4.5} rx={1.2}
                                fill={col} opacity={0.88}
                              />
                              <text
                                x={p.x + r + 6.5} y={p.y + 0.8}
                                fontSize="2.5" fill="white"
                                textAnchor="middle"
                                fontFamily="sans-serif" fontWeight="700"
                              >
                                {p.diameterUm} µm
                              </text>
                            </>
                          )}
                        </g>
                      )
                    })}

                    {/* ── Dot annotations (acne / redness / pigmentation) ── */}
                    {visibleDotAnnotations.map((pt) => {
                      const isSelected = selectedCondition === pt.conditionId
                      const r = isSelected ? 2.8 : 2.2
                      const outerR = r + 2
                      return (
                        <g key={pt.id}>
                          <circle cx={pt.x} cy={pt.y} r={outerR}
                            fill="none" stroke={pt.color}
                            strokeWidth={isSelected ? 0.8 : 0.5}
                            opacity={isSelected ? 0.9 : 0.55}
                          />
                          <circle cx={pt.x} cy={pt.y} r={r}
                            fill={pt.color} opacity={isSelected ? 1 : 0.75}
                          />
                          <circle cx={pt.x} cy={pt.y} r={0.8}
                            fill="white" opacity={0.9}
                          />
                          {isSelected && (
                            <>
                              <rect
                                x={pt.x + outerR + 0.5} y={pt.y - 2.5}
                                width={pt.label.length * 1.55 + 2} height={5}
                                rx={1.5} fill={pt.color} opacity={0.88}
                              />
                              <text
                                x={pt.x + outerR + 1.5} y={pt.y + 1.3}
                                fontSize="3" fill="white"
                                fontFamily="sans-serif" fontWeight="600"
                              >
                                {pt.label}
                              </text>
                            </>
                          )}
                        </g>
                      )
                    })}
                  </svg>

                  {/* Corner legend */}
                  <div className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-sm rounded-lg p-2.5 space-y-1">
                    <p className="text-[10px] font-semibold text-white mb-1 uppercase tracking-wide">Conditions</p>
                    {presentConditionIds.map((id) => {
                      const meta = CONDITION_META[id]
                      if (!meta) return null
                      return (
                        <div key={id} className="flex items-center gap-1.5 text-[10px]">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                          <span className="text-white leading-none">{meta.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCondition(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCondition === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Show All
                </button>
                {presentConditionIds.map((id) => {
                  const meta = CONDITION_META[id]
                  if (!meta) return null
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedCondition(selectedCondition === id ? null : id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                      style={
                        selectedCondition === id
                          ? { backgroundColor: meta.color, color: "white", borderColor: meta.color }
                          : { borderColor: meta.color, color: meta.color, backgroundColor: "transparent" }
                      }
                    >
                      {meta.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Conditions sidebar ── */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Detected Conditions</h3>
              {presentConditionIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No significant conditions detected.</p>
              ) : (
                <div className="space-y-2">
                  {presentConditionIds.map((id) => {
                    const meta = CONDITION_META[id]
                    if (!meta) return null
                    const score    = getScoreForId(id)
                    const severity = score !== null ? scoreSeverity(score) : null
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedCondition(selectedCondition === id ? null : id)}
                        className="w-full text-left p-3 rounded-lg border-2 transition-all"
                        style={
                          selectedCondition === id
                            ? { borderColor: meta.color, backgroundColor: meta.color + "18" }
                            : { borderColor: "transparent", backgroundColor: "hsl(var(--muted))" }
                        }
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: meta.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-tight">{meta.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{meta.description}</p>
                            {severity && (
                              <Badge
                                variant="outline"
                                className="mt-1 text-[10px] px-1.5 py-0"
                                style={{ borderColor: meta.color, color: meta.color }}
                              >
                                {severity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Tabs ── */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="home" className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Home
              </TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="measurements">
                <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />Measurements</span>
              </TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="recommendations">Tips</TabsTrigger>
            </TabsList>

            {/* Home */}
            <TabsContent value="home">
              <Card className="p-6 text-center">
                <div className="space-y-3">
                  <Home className="w-8 h-8 mx-auto text-primary" />
                  <p className="text-lg font-semibold">Ready to start a new scan?</p>
                  <p className="text-sm text-muted-foreground">Return to the face scanning screen to capture a new photo.</p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Go to Home
                  </Link>
                </div>
              </Card>
            </TabsContent>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {presentConditionIds.map((id) => {
                  const meta     = CONDITION_META[id]
                  if (!meta) return null
                  const score    = getScoreForId(id)
                  const severity = score !== null ? scoreSeverity(score) : "mild"
                  return (
                    <Card key={id} className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                        <span className="text-xs font-semibold leading-tight">{meta.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{severity}</Badge>
                      {score !== null && (
                        <p className="text-xs text-muted-foreground mt-1">Score: {score}/100</p>
                      )}
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Measurements */}
            <TabsContent value="measurements" className="space-y-5">
              {/* Wrinkle length table */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                  <Ruler className="w-4 h-4 text-[#7C3AED]" />
                  Wrinkle Length Measurements
                </h3>
                {wrinkles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {currentAnalysisResult
                      ? "No significant wrinkles detected in this scan."
                      : "Complete a scan to see wrinkle measurements."}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium">Location</th>
                          <th className="text-right py-2 pr-4 text-xs text-muted-foreground font-medium">Length</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">Depth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {wrinkles.map((w) => (
                          <tr key={w.id} className="hover:bg-muted/40 transition-colors">
                            <td className="py-2 pr-4 font-medium flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: DEPTH_COLORS[w.depthCategory] }} />
                              {w.label}
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums font-semibold text-[#7C3AED]">
                              {w.lengthMm} mm
                            </td>
                            <td className="py-2 text-right">
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize"
                                style={{
                                  borderColor: DEPTH_COLORS[w.depthCategory],
                                  color: DEPTH_COLORS[w.depthCategory],
                                }}
                              >
                                {w.depthCategory}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[11px] text-muted-foreground mt-3">
                      * Lengths are estimated measurements based on facial proportions. Surface = early-stage, Moderate = established, Deep = advanced.
                    </p>
                  </div>
                )}
              </Card>

              {/* Pore depth table */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                  <Circle className="w-4 h-4 text-[#2563EB]" />
                  Pore Size &amp; Depth Analysis
                </h3>
                {pores.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {currentAnalysisResult
                      ? "No enlarged pores detected in this scan."
                      : "Complete a scan to see pore measurements."}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium">Location</th>
                          <th className="text-right py-2 pr-4 text-xs text-muted-foreground font-medium">Diameter</th>
                          <th className="text-right py-2 pr-4 text-xs text-muted-foreground font-medium">Depth score</th>
                          <th className="text-right py-2 text-xs text-muted-foreground font-medium">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {pores.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                            <td className="py-2 pr-4 font-medium flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: PORE_DEPTH_COLORS[p.depthCategory] }} />
                              {p.label}
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums font-semibold text-[#2563EB]">
                              {p.diameterUm} µm
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums text-muted-foreground">
                              {p.depthScore}/100
                            </td>
                            <td className="py-2 text-right">
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize"
                                style={{
                                  borderColor: PORE_DEPTH_COLORS[p.depthCategory],
                                  color: PORE_DEPTH_COLORS[p.depthCategory],
                                }}
                              >
                                {p.depthCategory}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[11px] text-muted-foreground mt-3">
                      * Diameter in micrometres (µm). Normal pore size: 100–200 µm. Depth score reflects estimated follicle depth.
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Details */}
            <TabsContent value="details" className="space-y-4">
              {selectedCondition ? (() => {
                const meta = CONDITION_META[selectedCondition]
                return (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: meta.color }} />
                      {meta.name}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Description</p>
                        <p className="text-sm">{meta.description}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Affected Areas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {meta.areas.map((area) => (
                            <Badge key={area} variant="secondary">{area}</Badge>
                          ))}
                        </div>
                      </div>
                      {selectedCondition === "wrinkles" && wrinkles.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Wrinkle lines detected</p>
                          <p className="text-sm font-medium">{wrinkles.length} line(s) — longest: {Math.max(...wrinkles.map(w => w.lengthMm))} mm</p>
                        </div>
                      )}
                      {selectedCondition === "pores" && pores.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Pores analysed</p>
                          <p className="text-sm font-medium">{pores.length} pore(s) — largest: {Math.max(...pores.map(p => p.diameterUm))} µm</p>
                        </div>
                      )}
                      {selectedCondition !== "wrinkles" && selectedCondition !== "pores" && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Markers detected</p>
                          <p className="text-sm font-medium">
                            {annotations.filter((a) => a.conditionId === selectedCondition).length} point(s)
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })() : (
                <Card className="p-4 text-center text-muted-foreground text-sm">
                  Select a condition from the sidebar to see details.
                </Card>
              )}
            </TabsContent>

            {/* Recommendations */}
            <TabsContent value="recommendations" className="space-y-4">
              {selectedCondition ? (() => {
                const meta = CONDITION_META[selectedCondition]
                return (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-base">Treatment Recommendations</h3>
                    <ul className="space-y-2">
                      {meta.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: meta.color }} />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )
              })() : (
                <Card className="p-4 text-center text-muted-foreground text-sm">
                  Select a condition to see treatment recommendations.
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
