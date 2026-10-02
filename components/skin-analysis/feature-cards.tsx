import { Card, CardContent } from "@/components/ui/card"
import { Camera, Brain, BarChart3, Shield, Zap, Heart } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Easy Image Capture",
    description: "Take a photo or upload an existing image for instant analysis",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning models analyze your skin with dermatologist-level accuracy",
  },
  {
    icon: BarChart3,
    title: "Detailed Metrics",
    description: "Get scores for acne, pigmentation, wrinkles, hydration, and more",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your photos are processed securely and never stored on our servers",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Receive your comprehensive skin analysis in seconds",
  },
  {
    icon: Heart,
    title: "Personalized Care",
    description: "Get tailored skincare recommendations based on your unique skin profile",
  },
]

export function FeatureCards() {
  return (
    <section id="features" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
          Why Choose SkinAI?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our advanced AI technology provides professional-grade skin analysis 
          from the comfort of your home.
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="group hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
