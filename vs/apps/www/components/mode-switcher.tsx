"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { META_THEME_COLORS } from "@/config/site"
import { useMetaColor } from "@/hooks/use-meta-color"
import { Button } from "@/registry/new-york/ui/button"

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme()
  const { setMetaColor } = useMetaColor()

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
    setMetaColor(
      resolvedTheme === "dark"
        ? META_THEME_COLORS.light
        : META_THEME_COLORS.dark
    )
  }, [resolvedTheme, setTheme, setMetaColor])

  return (
    <Button
      variant="ghost"
      className="group/toggle h-8 w-8 px-0"
      onClick={toggleTheme}
    >
      <SunIcon className="[html.dark_&]:block [html.glassmorphsm_&]:block" />
      <MoonIcon className="html.light_&]:block [html.glassmorphsm_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
