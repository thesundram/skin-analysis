"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Camera, Upload, X, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ImageCaptureProps {
  onImageCapture: (imageData: string) => void
  isAnalyzing: boolean
}

export function ImageCapture({ onImageCapture, isAnalyzing }: ImageCaptureProps) {
  const [mode, setMode] = useState<"upload" | "camera" | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Start / stop the media stream when mode changes
  useEffect(() => {
    if (mode !== "camera") return

    let cancelled = false
    setCameraError(null)
    setIsCameraReady(false)

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop())
          return
        }
        setStream(mediaStream)
      })
      .catch((err) => {
        console.error("Camera error:", err)
        if (!cancelled) {
          setCameraError("Unable to access camera. Please check permissions or try uploading an image.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [mode])

  // Assign stream to video element whenever stream changes
  useEffect(() => {
    if (!videoRef.current || !stream) return
    videoRef.current.srcObject = stream
    videoRef.current.play().catch((err) => console.error("Video play error:", err))
  }, [stream])

  // Stop the stream when it is replaced or component unmounts
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
    setIsCameraReady(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const width = video.videoWidth || 640
    const height = video.videoHeight || 480
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Mirror to match the mirrored preview
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -width, 0, width, height)
    ctx.restore()

    const imageData = canvas.toDataURL("image/jpeg", 0.9)
    setCapturedImage(imageData)
    stopCamera()
  }, [stopCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) setCapturedImage(e.target.result as string)
    }
    reader.readAsDataURL(file)
    // Reset input so the same file can be re-selected
    event.target.value = ""
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) setCapturedImage(e.target.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const reset = () => {
    setCapturedImage(null)
    setMode(null)
    setCameraError(null)
    setIsCameraReady(false)
  }

  const handleCancel = () => {
    stopCamera()
    setMode(null)
    setCameraError(null)
  }

  const handleAnalyze = () => {
    if (capturedImage) onImageCapture(capturedImage)
  }

  // ── Captured image preview ────────────────────────────────────────────────
  if (capturedImage) {
    return (
      <Card className="overflow-hidden border-2 border-primary/20">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured skin"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={reset}
                disabled={isAnalyzing}
                className="bg-card/90 hover:bg-card"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-primary hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Skin
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Live camera view ──────────────────────────────────────────────────────
  if (mode === "camera") {
    return (
      <Card className="overflow-hidden border-2 border-primary/20">
        <CardContent className="p-0">
          <div className="relative bg-black">
            {cameraError ? (
              <div className="w-full aspect-[4/3] flex items-center justify-center bg-muted p-8 text-center">
                <div>
                  <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">{cameraError}</p>
                  <Button variant="outline" onClick={() => { setCameraError(null); setMode("upload") }}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Instead
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* The video element is always rendered so videoRef is stable */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onCanPlay={() => setIsCameraReady(true)}
                  className="w-full aspect-[4/3] object-cover scale-x-[-1]"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Loading overlay while stream is starting */}
                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="flex flex-col items-center gap-3 text-white">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <p className="text-sm">Starting camera...</p>
                    </div>
                  </div>
                )}

                {/* Face guide overlay */}
                {isCameraReady && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-8 border-2 border-white/50 rounded-full" />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap">
                      Position your face in the oval
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent">
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="bg-card/90 hover:bg-card"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              {!cameraError && (
                <Button
                  onClick={capturePhoto}
                  disabled={!isCameraReady}
                  className="bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Mode selection ────────────────────────────────────────────────────────
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg",
          "border-2 border-dashed"
        )}
        onClick={() => setMode("camera")}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[200px]">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">Take Photo</h3>
          <p className="text-muted-foreground text-center text-sm">
            Use your camera to capture a real-time skin analysis
          </p>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg",
          "border-2 border-dashed"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[200px]">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">Upload Image</h3>
          <p className="text-muted-foreground text-center text-sm">
            Drag and drop or click to upload an existing photo
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  )
}
