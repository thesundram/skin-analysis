"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Footer } from "@/components/skin-analysis/footer"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Sign up failed")
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      {/* Top Header with Back to Home button */}
      <header className="w-full border-b bg-background/80 backdrop-blur sticky top-0 z-40 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors">
            SkinAI Portal
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="h-12 w-12 rounded-xl bg-muted/60 p-1.5 border border-border/60 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Image
                    src="/company-logo.png"
                    alt="Company Logo"
                    width={42}
                    height={42}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold tracking-tight text-foreground">SkinAI</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      Portal
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Uttam Galva Innovative Solutions</p>
                </div>
              </Link>
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Start your personalized skin health and analysis journey</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Sundram"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {error && <FieldError>{error}</FieldError>}
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                Create Account
              </Button>
              <div className="flex flex-col gap-2 text-center text-sm">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Return to Home Page</span>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
