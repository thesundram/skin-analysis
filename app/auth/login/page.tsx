"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Footer } from "@/components/skin-analysis/footer"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
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
      <div className="flex-1 flex items-center justify-center p-4">
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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to view your skin analysis history</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent>
              <FieldGroup>
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
                    placeholder="Your password"
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
                Sign In
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
