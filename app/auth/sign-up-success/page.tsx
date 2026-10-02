import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Sparkles } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-8 w-8" />
              <span className="text-2xl font-bold">SkinAI</span>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a confirmation link to verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to activate your account and start your
            personalized skin analysis journey.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
