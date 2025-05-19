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
} from "@/registry/default/ui/card"

// Original G2 example path: integration/G2/site/examples/graph/network/demo/chord.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_graph_network_chord() {
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
          width: 900,
          height: 600,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        const data = [
          {
            source: "北京",
            target: "天津",
            value: 30,
          },
          {
            source: "北京",
            target: "上海",
            value: 80,
          },
          {
            source: "北京",
            target: "河北",
            value: 46,
          },
          {
            source: "北京",
            target: "辽宁",
            value: 49,
          },
          {
            source: "北京",
            target: "黑龙江",
            value: 69,
          },
          {
            source: "北京",
            target: "吉林",
            value: 19,
          },
          {
            source: "天津",
            target: "河北",
            value: 62,
          },
          {
            source: "天津",
            target: "辽宁",
            value: 82,
          },
          {
            source: "天津",
            target: "上海",
            value: 16,
          },
          {
            source: "上海",
            target: "黑龙江",
            value: 16,
          },
          {
            source: "河北",
            target: "黑龙江",
            value: 76,
          },
          {
            source: "河北",
            target: "内蒙古",
            value: 24,
          },
          {
            source: "内蒙古",
            target: "北京",
            value: 32,
          },
        ]

        g2ChartInstance.current
          .chord()
          .data({
            value: { links: data },
          })
          .layout({
            nodeWidthRatio: 0.05,
          })
          .scale("color", { range: schemeTableau10 })
          .style("labelFontSize", 15)
          .style("linkFillOpacity", 0.6)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/graph/network/demo/chord.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/graph/network/demo/chord.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/graph/network/demo/chord.ts:",
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
        <CardTitle>Chord</CardTitle>
        <CardDescription>
          G2 Chart. Original example: graph/network/demo/chord.ts
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
