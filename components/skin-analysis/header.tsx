"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut, LayoutDashboard, Sparkles, Eye, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export interface HeaderUser {
  id: string
  email: string
  fullName?: string
}

interface HeaderProps {
  user?: HeaderUser | null
}

export function Header({ user: initialUser }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState<HeaderUser | null>(initialUser ?? null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (initialUser !== undefined) {
      setCurrentUser(initialUser)
      return
    }

    // If initialUser was not passed, detect via /api/auth/me
    let isMounted = true
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.authenticated && data.user) {
          setCurrentUser(data.user)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [initialUser])

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Sign out error:", err)
    } finally {
      setCurrentUser(null)
      router.push("/auth/login")
      router.refresh()
    }
  }

  const userInitials = currentUser?.fullName
    ? currentUser.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : currentUser?.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : "US"

  const navLinkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href
        ? "text-primary font-semibold"
        : "text-muted-foreground hover:text-foreground"
    }`

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-muted/60 p-1 border border-border/60 transition-transform group-hover:scale-105">
            <Image
              src="/company-logo.png"
              alt="Company Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-foreground">SkinAI</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                Portal
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block leading-none">
              Uttam Galva Innovative Solutions
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className={navLinkClass("/")}>
            Home
          </Link>

          {currentUser ? (
            <>
              <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link
                href="/analysis-visualization"
                className={navLinkClass("/analysis-visualization")}
              >
                Visualization
              </Link>
            </>
          ) : (
            <>
              <Link href="/#how-it-works" className={navLinkClass("/#how-it-works")}>
                How It Works
              </Link>
              <Link href="/#features" className={navLinkClass("/#features")}>
                Features
              </Link>
              <Link
                href="/analysis-visualization"
                className={navLinkClass("/analysis-visualization")}
              >
                Visualization
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {pathname !== "/dashboard" && (
                <Button size="sm" variant="outline" asChild className="gap-1.5">
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser.fullName || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analysis-visualization" className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Visualization Tool</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="gap-1.5">
                <Link href="/auth/sign-up">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {currentUser && (
              <div className="flex items-center gap-3 pb-3 mb-2 border-b">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">
                    {currentUser.fullName || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            )}

            <Link
              href="/"
              className={navLinkClass("/")}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  className={navLinkClass("/dashboard")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/analysis-visualization"
                  className={navLinkClass("/analysis-visualization")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Visualization
                </Link>
                <div className="pt-2 border-t mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive justify-center gap-2"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/#how-it-works"
                  className={navLinkClass("/#how-it-works")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="/#features"
                  className={navLinkClass("/#features")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/analysis-visualization"
                  className={navLinkClass("/analysis-visualization")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Visualization
                </Link>
                <div className="flex flex-col gap-2 pt-3 border-t mt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
