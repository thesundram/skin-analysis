import { Camera, Sparkles, ClipboardList } from "lucide-react"

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Capture Your Skin",
    description: "Take a clear, well-lit photo of your face or upload an existing image. Ensure good lighting and remove any makeup for best results.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI Analysis",
    description: "Our advanced AI processes your image, detecting and analyzing various skin conditions including acne, pigmentation, wrinkles, and more.",
  },
  {
    icon: ClipboardList,
    step: "03",
    title: "Get Results",
    description: "Receive a comprehensive report with scores, identified concerns, and personalized skincare recommendations tailored to your skin type.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get your personalized skin analysis in three simple steps
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
            )}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">{step.step}</span>
                </div>
              </div>
              <h3 className="font-semibold text-xl mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
