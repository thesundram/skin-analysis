import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border/50 bg-background/50 py-6">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-2">
        <p className="text-[11px] sm:text-xs text-center text-muted-foreground leading-relaxed px-2">
          © {new Date().getFullYear()} Designed &amp; Developed by{" "}
          <a
            href="https://uttaminnovativesolutions.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors underline-offset-4 hover:underline"
          >
            Uttam Galva Innovative Solutions Pvt. Ltd.
          </a>
        </p>
        <p className="text-[10px] text-center text-muted-foreground/70 max-w-xl">
          Disclaimer: This AI skin analysis is intended for informational and educational screening purposes only and does not substitute professional dermatological advice.
        </p>
      </div>
    </footer>
  )
}
