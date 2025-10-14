"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Activity } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switcher"
import { CustomConnectButton } from "./connect-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { useAuth } from "@/hooks/use-auth"
import { useAccount } from "wagmi"

export function Header() {
  const { t } = useLanguage()
  const { isConnected } = useAccount()
  const { login, isLoading: authLoading } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 🔥 移除重复的认证触发逻辑 - 现在由 AuthProvider 统一管理
  // useEffect(() => {
  //   if (isConnected && !authLoading) {
  //     login()
  //   }
  // }, [isConnected, authLoading, login])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-primary/30 bg-background/95 backdrop-blur-2xl shadow-lg shadow-primary/5"
          : "border-primary/20 bg-background/80 backdrop-blur-xl"
      } supports-[backdrop-filter]:bg-background/60`}
    >
      <div
        className={`container flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className={`flex items-center justify-center rounded-lg bg-primary transition-all duration-300 ${
                scrolled ? "h-7 w-7" : "h-8 w-8"
              } group-hover:neon-glow`}
            >
              <Activity
                className={`text-primary-foreground transition-all duration-300 ${scrolled ? "h-4 w-4" : "h-5 w-5"}`}
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-bold leading-none bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-all duration-300 ${
                  scrolled ? "text-base" : "text-lg"
                }`}
              >
                {t("common.appName")}
              </span>
              <span
                className={`text-muted-foreground leading-none transition-all duration-300 ${
                  scrolled ? "text-[10px]" : "text-xs"
                }`}
              >
                {t("common.tagline")}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              href="/events"
              className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
            >
              {t("nav.events")}
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
            >
              {t("nav.settings")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <CustomConnectButton />
        </div>
      </div>
    </header>
  )
}
