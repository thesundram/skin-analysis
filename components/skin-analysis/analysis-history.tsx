"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts"
import type { HistoryEntry } from "@/lib/types"
import { useState } from "react"
import { TrendingUp, TrendingDown, Minus, Calendar, ArrowRight, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface AnalysisHistoryProps {
  history: HistoryEntry[]
  onDeleteEntry?: (id: string) => Promise<void> | void
  onClearHistory?: () => Promise<void> | void
}

const METRIC_LABELS: Record<string, string> = {
  acne: "Acne",
  pigmentation: "Pigmentation",
  wrinkles: "Wrinkles",
  oiliness: "Oiliness",
  redness: "Redness",
  hydration: "Hydration",
  pores: "Pores",
  texture: "Texture",
}

const METRIC_COLORS: Record<string, string> = {
  acne: "var(--chart-1)",
  pigmentation: "var(--chart-2)",
  wrinkles: "var(--chart-3)",
  oiliness: "var(--chart-4)",
  redness: "var(--chart-5)",
  hydration: "var(--primary)",
  pores: "var(--chart-2)",
  texture: "var(--chart-4)",
}

function getScoreColor(score: number, isInverse: boolean = false): string {
  // For inverse metrics (acne, oiliness, redness), lower is better
  const effectiveScore = isInverse ? 100 - score : score
  if (effectiveScore >= 80) return "text-success"
  if (effectiveScore >= 60) return "text-chart-4"
  if (effectiveScore >= 40) return "text-warning"
  return "text-destructive"
}

function getTrendBadge(current: number, previous: number, isInverse: boolean = false) {
  const diff = current - previous
  // For inverse metrics, decrease is good
  const isImprovement = isInverse ? diff < 0 : diff > 0
  
  if (diff === 0) return <Badge variant="secondary" className="text-xs">No change</Badge>
  
  return (
    <Badge 
      variant={isImprovement ? "default" : "destructive"} 
      className={cn("text-xs", isImprovement ? "bg-success" : "")}
    >
      {diff > 0 ? "+" : ""}{diff}
    </Badge>
  )
}

export function AnalysisHistory({ history, onDeleteEntry, onClearHistory }: AnalysisHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)

  const handleDelete = async (id: string) => {
    if (!onDeleteEntry) return
    const confirmed = window.confirm("Are you sure you want to remove this scan from your history?")
    if (!confirmed) return

    setDeletingId(id)
    try {
      await onDeleteEntry(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleClear = async () => {
    if (!onClearHistory) return
    const confirmed = window.confirm("Are you sure you want to clear all your skin analysis history? This cannot be undone.")
    if (!confirmed) return

    setIsClearing(true)
    try {
      await onClearHistory()
    } finally {
      setIsClearing(false)
    }
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2 text-foreground">No History Yet</h3>
          <p className="text-muted-foreground">
            Complete your first skin analysis to start tracking your progress over time.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Your last 5 analyses will be stored for comparison.
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = history.map(entry => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    overall: entry.overallScore,
    hydration: entry.scores.hydration,
    texture: entry.scores.texture,
    clarity: 100 - entry.scores.acne,
  }))

  const latestEntry = history[history.length - 1]
  const previousEntry = history.length > 1 ? history[history.length - 2] : null
  const oldestEntry = history[0]
  
  const latestScore = latestEntry.overallScore
  const previousScore = previousEntry?.overallScore ?? latestScore
  const trend = latestScore - previousScore
  
  // Calculate overall improvement from first to last
  const totalImprovement = latestScore - oldestEntry.overallScore

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground"

  // Inverse metrics (lower is better)
  const inverseMetrics = ["acne", "pigmentation", "wrinkles", "oiliness", "redness", "pores"]

  // Comparison data for bar chart
  const comparisonData = Object.keys(METRIC_LABELS).map(metric => {
    const key = metric as keyof typeof latestEntry.scores
    const latest = latestEntry.scores[key]
    const previous = previousEntry?.scores[key] ?? latest
    const isInverse = inverseMetrics.includes(metric)
    
    return {
      metric: METRIC_LABELS[metric],
      latest,
      previous,
      change: latest - previous,
      isInverse,
      // Display score (for inverse metrics, show improvement as 100 - score)
      latestDisplay: isInverse ? 100 - latest : latest,
      previousDisplay: isInverse ? 100 - previous : previous,
    }
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Score</p>
                <p className="text-3xl font-bold text-foreground">{latestScore}</p>
              </div>
              <div className={cn("flex items-center gap-1", trendColor)}>
                <TrendIcon className="w-5 h-5" />
                <span className="font-semibold">{Math.abs(trend)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Analyses Stored</p>
            <p className="text-3xl font-bold text-foreground">{history.length}<span className="text-lg text-muted-foreground">/5</span></p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-3xl font-bold text-foreground">
              {Math.round(history.reduce((sum, h) => sum + h.overallScore, 0) / history.length)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Progress</p>
            <p className={cn(
              "text-3xl font-bold",
              totalImprovement > 0 ? "text-success" : totalImprovement < 0 ? "text-destructive" : "text-foreground"
            )}>
              {totalImprovement > 0 ? "+" : ""}{totalImprovement}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score Trends (Last 5 Analyses)</CardTitle>
          <CardDescription>Track your skin health improvement over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="overall" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--primary)", strokeWidth: 2, r: 5 }}
                  name="Overall Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="hydration" 
                  stroke="var(--chart-2)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-2)", r: 4 }}
                  name="Hydration"
                />
                <Line 
                  type="monotone" 
                  dataKey="texture" 
                  stroke="var(--chart-4)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-4)", r: 4 }}
                  name="Texture"
                />
                <Line 
                  type="monotone" 
                  dataKey="clarity" 
                  stroke="var(--chart-5)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-5)", r: 4 }}
                  name="Skin Clarity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      {history.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Comparison</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>
                {new Date(previousEntry!.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <ArrowRight className="w-4 h-4" />
              <span>
                {new Date(latestEntry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-center">Previous</TableHead>
                  <TableHead className="text-center">Current</TableHead>
                  <TableHead className="text-center">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-primary/5">
                  <TableCell className="font-semibold">Overall Score</TableCell>
                  <TableCell className="text-center font-mono">{previousScore}</TableCell>
                  <TableCell className="text-center font-mono font-bold">{latestScore}</TableCell>
                  <TableCell className="text-center">
                    {getTrendBadge(latestScore, previousScore, false)}
                  </TableCell>
                </TableRow>
                {comparisonData.map(item => (
                  <TableRow key={item.metric}>
                    <TableCell>{item.metric}</TableCell>
                    <TableCell className={cn("text-center font-mono", getScoreColor(item.previous, item.isInverse))}>
                      {item.previous}
                    </TableCell>
                    <TableCell className={cn("text-center font-mono font-medium", getScoreColor(item.latest, item.isInverse))}>
                      {item.latest}
                    </TableCell>
                    <TableCell className="text-center">
                      {getTrendBadge(item.latest, item.previous, item.isInverse)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Metric Comparison Bar Chart */}
      {history.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metric Comparison</CardTitle>
            <CardDescription>Visual comparison between your last two analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="metric" 
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="previous" fill="var(--muted-foreground)" name="Previous" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="latest" fill="var(--primary)" name="Current" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">Analysis Timeline</CardTitle>
            <CardDescription>Your last {history.length} skin analyses</CardDescription>
          </div>
          {onClearHistory && history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 text-xs gap-1.5"
              disabled={isClearing}
              onClick={handleClear}
            >
              {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Clear History</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.slice().reverse().map((entry, index) => {
              const prevEntry = index < history.length - 1 ? history[history.length - 2 - index] : null
              const scoreDiff = prevEntry ? entry.overallScore - prevEntry.overallScore : 0
              const isDeleting = deletingId === entry.id
              
              return (
                <div 
                  key={entry.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-opacity",
                    index === 0 ? "bg-primary/5 border-primary/20" : "bg-muted/30",
                    isDeleting && "opacity-40 pointer-events-none"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {history.length - index}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {prevEntry && scoreDiff !== 0 && (
                      <div className={cn(
                        "flex items-center gap-1 text-sm",
                        scoreDiff > 0 ? "text-success" : "text-destructive"
                      )}>
                        {scoreDiff > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{scoreDiff > 0 ? "+" : ""}{scoreDiff}</span>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{entry.overallScore}</p>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                    {onDeleteEntry && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg ml-1"
                        disabled={isDeleting}
                        title="Delete from history"
                        onClick={() => handleDelete(entry.id)}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
