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

// Original G2 example path: integration/G2/site/examples/general/heatmap/demo/mouse-heatmap.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_heatmap_mouse_heatmap() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const data = {}

  // Trailing helpers extracted from original:
  function transform(dataMap) {
    const arr = []
    Object.keys(dataMap).forEach((x) => {
      Object.keys(dataMap[x]).forEach((y) => {
        arr.push({ x, y, v: dataMap[x][y] })
      })
    })
    return arr
  }

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
          width: 640,
          height: 480,
          padding: 0,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current.style({
          viewFill: "#4e79a7",
        })

        g2ChartInstance.current.data([])
        g2ChartInstance.current.axis(false)

        g2ChartInstance.current
          .heatmap()
          .encode("x", "x")
          .encode("y", "y")
          .encode("color", "v")
          .scale("x", { domain: [0, 640] })
          .scale("y", { domain: [0, 480], range: [0, 1] })
          .style("opacity", 0)
          .tooltip(false)
          .animate(false)

        g2ChartInstance.current.render()

        g2ChartInstance.current.on(
          "plot:pointermove",
          throttle((e) => {
            const { x, y } = e

            const kx = Math.floor(x - (x % 8))
            const ky = Math.floor(y - (y % 8))

            if (!data[kx]) data[kx] = {}
            if (!data[kx][ky]) data[kx][ky] = 0

            data[kx][ky] += 1

            const d = transform(data)

            g2ChartInstance.current.changeData(d)
          })
        )
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/heatmap/demo/mouse-heatmap.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/heatmap/demo/mouse-heatmap.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/heatmap/demo/mouse-heatmap.ts:",
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
        <CardTitle>Mouse Heatmap</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/heatmap/demo/mouse-heatmap.ts
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
