import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/skin-analysis/header"
import { SkinAnalyzer } from "@/components/skin-analysis/skin-analyzer"
import { FeatureCards } from "@/components/skin-analysis/feature-cards"
import { HowItWorks } from "@/components/skin-analysis/how-it-works"
import { Footer } from "@/components/skin-analysis/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser()
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                AI-Powered Skin Analysis
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
                Understand Your Skin Like Never Before
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-pretty">
                Get instant, AI-powered analysis of your skin health. Detect concerns, 
                track improvements, and receive personalized skincare recommendations.
              </p>
            </div>

            {/* Main Analysis Card */}
            <Card className="max-w-4xl mx-auto shadow-lg border-2">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Start Your Analysis</CardTitle>
                <CardDescription>
                  Take a photo or upload an image to begin your skin health assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Welcome back, {user.fullName || user.email}! Continue to your personalized dashboard for full analysis and history tracking.
                    </p>
                    <Button size="lg" asChild>
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  </div>
                ) : (
                  <SkinAnalyzer />
                )}
              </CardContent>
            </Card>
            
            {!user && (
              <div className="text-center mt-8">
                <p className="text-muted-foreground mb-4">
                  Create an account to save your analysis history and track your skin health over time.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/sign-up">Create Account</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 scroll-mt-20">
          <FeatureCards />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-muted/30 scroll-mt-20">
          <div className="container mx-auto px-4">
            <HowItWorks />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-4 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">8+</div>
                <div className="text-muted-foreground">Skin Metrics Analyzed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Analysis Accuracy</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">{"<"}5s</div>
                <div className="text-muted-foreground">Analysis Time</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Privacy Focused</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
