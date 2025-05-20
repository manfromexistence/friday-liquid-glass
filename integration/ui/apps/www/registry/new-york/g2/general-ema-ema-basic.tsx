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

// Original G2 example path: integration/G2/site/examples/general/ema/demo/ema-basic.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_ema_ema_basic() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.

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
          height: 300,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current.options({
          type: "view",
          children: [
            {
              type: "line",
              data: {
                type: "inline",
                value: [
                  { x: 0, y: 30 },
                  { x: 1, y: 80 },
                  { x: 2, y: 45 },
                  { x: 3, y: 90 },
                  { x: 4, y: 20 },
                  { x: 5, y: 60 },
                  { x: 6, y: 30 },
                  { x: 7, y: 85 },
                  { x: 8, y: 40 },
                  { x: 9, y: 70 },
                ],
                transform: [
                  {
                    type: "ema",
                    field: "y",
                    alpha: 0.6,
                    as: "emaY",
                  },
                ],
              },
              encode: {
                x: "x",
                y: "emaY",
              },
              style: {
                stroke: "#f90",
                lineWidth: 2,
              },
            },
            {
              type: "line",
              data: {
                type: "inline",
                value: [
                  { x: 0, y: 30 },
                  { x: 1, y: 80 },
                  { x: 2, y: 45 },
                  { x: 3, y: 90 },
                  { x: 4, y: 20 },
                  { x: 5, y: 60 },
                  { x: 6, y: 30 },
                  { x: 7, y: 85 },
                  { x: 8, y: 40 },
                  { x: 9, y: 70 },
                ],
              },
              encode: {
                x: "x",
                y: "y",
              },
              style: {
                stroke: "#ccc",
                lineDash: [4, 2],
              },
            },
          ],
        })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/ema/demo/ema-basic.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/ema/demo/ema-basic.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/ema/demo/ema-basic.ts:",
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
        <CardTitle>Ema Chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/ema/demo/ema-basic.ts
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
