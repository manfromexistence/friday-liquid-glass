// @ts-nocheck
"use client"

import React, { useEffect, useRef } from "react"
import { Chart, register } from "@antv/g2"

import { useShadcnChartColors } from "@/hooks/use-shadcn-chart-colors"
// Import the hook
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"

// Original G2 example path: integration/G2/site/examples/general/radar/demo/radar.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_radar_radar() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const data = [
    { item: "Design", type: "a", score: 70 },
    { item: "Design", type: "b", score: 30 },
    { item: "Development", type: "a", score: 60 },
    { item: "Development", type: "b", score: 70 },
    { item: "Marketing", type: "a", score: 50 },
    { item: "Marketing", type: "b", score: 60 },
    { item: "Users", type: "a", score: 40 },
    { item: "Users", type: "b", score: 50 },
    { item: "Test", type: "a", score: 60 },
    { item: "Test", type: "b", score: 70 },
    { item: "Language", type: "a", score: 70 },
    { item: "Language", type: "b", score: 50 },
    { item: "Technology", type: "a", score: 50 },
    { item: "Technology", type: "b", score: 40 },
    { item: "Support", type: "a", score: 30 },
    { item: "Support", type: "b", score: 40 },
    { item: "Sales", type: "a", score: 60 },
    { item: "Sales", type: "b", score: 40 },
    { item: "UX", type: "a", score: 50 },
    { item: "UX", type: "b", score: 60 },
  ]

  const chartRef = useRef<HTMLDivElement>(null)
  const g2ChartInstance = useRef<Chart | null>(null)
  const shadcnColors = useShadcnChartColors(chartRef) // Use the hook

  useEffect(() => {
    // Palette registration must happen before G2 chart initialization attempts to use it.
    // It also needs to happen after shadcnColors are resolved.
    // And chartRef.current must exist for getComputedStyle to work in the hook.

    // Register the palette once colors are resolved (or with fallback).
    // Check if shadcnColors are not the initial fallback to ensure hook has run or CSS vars are applied.
    // The hook itself returns FALLBACK_COLORS initially or if resolution fails.
    if (shadcnColors && shadcnColors.length === 5) {
      try {
        register("palette.shadcnPalette", () => shadcnColors)
      } catch (e) {
        console.error(
          "Error registering shadcnPalette, G2 'register' might not be available or shadcnColors are invalid:",
          e,
          shadcnColors
        )
        // Fallback registration if the above fails for any reason
        register("palette.shadcnPalette", () =>
          JSON.parse(FALLBACK_COLORS_JSON)
        )
      }
    } else {
      // Fallback if shadcnColors is not yet ready or invalid
      console.warn(
        "Shadcn colors not ready or invalid, using fallback palette for G2 chart."
      )
      register("palette.shadcnPalette", () => JSON.parse(FALLBACK_COLORS_JSON))
    }

    if (chartRef.current && !g2ChartInstance.current) {
      try {
        // --- G2 Chart Logic Start ---
        g2ChartInstance.current = new Chart({
          container: chartRef.current,
          autoFit: true,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current.coordinate({ type: "polar" })

        g2ChartInstance.current
          .data(data)
          .scale("x", { padding: 0.5, align: 0 })
          .scale("y", { tickCount: 5 })
          .axis("x", { grid: true })
          .axis("y", { zIndex: 1, title: false })

        g2ChartInstance.current
          .area()
          .encode("x", "item")
          .encode("y", "score")
          .encode("color", "type")
          .encode("shape", "smooth")
          .style("fillOpacity", 0.5)
          .scale("y", { domainMax: 80 })

        g2ChartInstance.current
          .line()
          .encode("x", "item")
          .encode("y", "score")
          .encode("color", "type")
          .encode("shape", "smooth")
          .style("lineWidth", 2)

        g2ChartInstance.current.interaction("tooltip", {
          crosshairsLineDash: [4, 4],
        })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/radar/demo/radar.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/radar/demo/radar.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/radar/demo/radar.ts:",
            e
          )
        }
        g2ChartInstance.current = null
      }
    }
  }, [shadcnColors])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Radar</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/radar/demo/radar.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }}>
          {/* G2 Chart will be rendered here by the useEffect hook */}
        </div>
      </CardContent>
    </Card>
  )
}
