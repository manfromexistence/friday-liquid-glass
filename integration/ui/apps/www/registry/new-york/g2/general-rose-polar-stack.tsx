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

// Original G2 example path: integration/G2/site/examples/general/rose/demo/polar-stack.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_rose_polar_stack() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const data = [
    { year: "2000", "类型 A": 21.0, "类型 B": 16, "类型 C": 8 },
    { year: "2001", "类型 A": 25.0, "类型 B": 16, "类型 C": 8 },
    { year: "2002", "类型 A": 25.0, "类型 B": 15, "类型 C": 8 },
    { year: "2003", "类型 A": 25.0, "类型 B": 14, "类型 C": 7 },
    { year: "2004", "类型 A": 25.0, "类型 B": 14, "类型 C": 7 },
    { year: "2005", "类型 A": 24.0, "类型 B": 13, "类型 C": 8 },
    { year: "2006", "类型 A": 24.0, "类型 B": 14, "类型 C": 7 },
    { year: "2007", "类型 A": 26.0, "类型 B": 16, "类型 C": 7 },
    { year: "2008", "类型 A": 26.0, "类型 B": 15.2, "类型 C": 8 },
    { year: "2009", "类型 A": 27.1, "类型 B": 15.2, "类型 C": 10 },
    { year: "2010", "类型 A": 27.5, "类型 B": 15.4, "类型 C": 8 },
    { year: "2011", "类型 A": 26.4, "类型 B": 15.2, "类型 C": 9 },
    { year: "2012", "类型 A": 28.8, "类型 B": 15.4, "类型 C": 9 },
    { year: "2013", "类型 A": 33.3, "类型 B": 16.7, "类型 C": 12 },
    { year: "2014", "类型 A": 38.2, "类型 B": 19.5, "类型 C": 18 },
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
          width: 720,
          height: 720,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current.coordinate({ type: "polar", innerRadius: 0.1 })

        g2ChartInstance.current
          .interval()
          .data({
            value: data,
            transform: [
              {
                type: "fold",
                fields: ["类型 A", "类型 B", "类型 C"],
                key: "难民类型",
                value: "count",
              },
            ],
          })

          .encode("x", "year")
          .encode("y", "count")
          .encode("color", "难民类型")
          .scale("x", { padding: 0 })
          .style({
            lineWidth: 1,
            stroke: "#fff",
          })
          .transform([{ type: "stackY" }])
          .axis("x", {
            line: true,
            grid: true,
            gridLineDash: [0, 0],
            gridLineWidth: 1,
          })
          .axis("y", {
            title: false,
            line: true,
            gridLineWidth: 1,
          })
          .legend({
            color: {
              position: "bottom",
              layout: {
                justifyContent: "center",
              },
            },
          })
          .state("active", { stroke: "black", lineWidth: 1, zIndex: 101 })
          .state("inactive", { opacity: 0.5, zIndex: 100 })

        g2ChartInstance.current.interaction("tooltip", {
          body: false,
          crosshairsStroke: "red",
          crosshairsStrokeWidth: 4,
        })

        g2ChartInstance.current.interaction("elementHighlight", true)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/rose/demo/polar-stack.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/rose/demo/polar-stack.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/rose/demo/polar-stack.ts:",
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
        <CardTitle>stacked column chart in polar coordinate</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/rose/demo/polar-stack.ts
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
