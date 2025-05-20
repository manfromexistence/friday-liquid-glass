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

// Original G2 example path: integration/G2/site/examples/component/legend/demo/nav-style.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_component_legend_nav_style() {
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
          height: 350,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current.options({
          type: "interval",
          data: [
            { genre: "Sports", sold: 50 },
            { genre: "Strategy", sold: 115 },
            { genre: "Action", sold: 120 },
            { genre: "Shooter", sold: 350 },
            { genre: "Other", sold: 150 },
          ],
          encode: { x: "genre", y: "sold", color: "genre" },
          legend: {
            color: {
              itemWidth: 160,
              navEffect: "cubic-bezier",
              navDuration: 400,
              navOrientation: "vertical",
              navDefaultPage: 2,
              navLoop: true,

              //配置navPageNum的绘图属性
              navPageNumFontSize: 16,
              navPageNumFontFamily: "sans-serif",
              navPageNumFontWeight: 500,
              navPageNumLineHeight: 20,
              navPageNumTextAlign: "center",
              navPageNumTextBaseline: "middle",
              navPageNumFill: "#2989FF",
              navPageNumFillOpacity: 0.9,
              navPageNumStroke: "#DAF5EC",
              navPageNumStrokeOpacity: 0.9,
              navPageNumLineWidth: 2,
              navPageNumLineDash: [4, 8],
              navPageNumOpacity: 1,
              navPageNumShadowColor: "#d3d3d3",
              navPageNumShadowBlur: 10,
              navPageNumShadowOffsetX: 10,
              navPageNumShadowOffsetY: 10,
              navPageNumCursor: "pointer",

              // 配置navButton的绘图属性
              navButtonFill: "#2989FF",
              navButtonFillOpacity: 0.7,
              navButtonStroke: "#DAF5EC",
              navButtonStrokeOpacity: 0.9,
              navButtonLineWidth: 2,
              navButtonLineDash: [4, 8],
              navButtonOpacity: 0.9,
              navButtonShadowColor: "#d3d3d3",
              navButtonShadowBlur: 10,
              navButtonShadowOffsetX: 10,
              navButtonShadowOffsetY: 10,
              navButtonCursor: "pointer",

              navFormatter: (current, total) => `第${current}页/共${total}页`,
            },
          },
        })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/component/legend/demo/nav-style.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/component/legend/demo/nav-style.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/component/legend/demo/nav-style.ts:",
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
        <CardTitle>Legend Nav Style</CardTitle>
        <CardDescription>
          G2 Chart. Original example: component/legend/demo/nav-style.ts
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
