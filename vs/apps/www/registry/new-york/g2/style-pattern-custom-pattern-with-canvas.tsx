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

// Original G2 example path: integration/G2/site/examples/style/pattern/demo/custom-pattern-with-canvas.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_style_pattern_custom_pattern_with_canvas() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Default data used as a fallback because no specific data source was detected:
  const data = [
    { site: "MN", variety: "Manchuria", yield: 32.4, year: 1932 },
    { site: "MN", variety: "Manchuria", yield: 30.7, year: 1931 },
    { site: "MN", variety: "Glabron", yield: 33.1, year: 1932 },
    { site: "MN", variety: "Glabron", yield: 33, year: 1931 },
    { site: "MN", variety: "Svansota", yield: 29.3, year: 1932 },
    { site: "MN", variety: "Svansota", yield: 30.8, year: 1931 },
    { site: "MN", variety: "Velvet", yield: 32, year: 1932 },
    { site: "MN", variety: "Velvet", yield: 33.3, year: 1931 },
    { site: "MN", variety: "Peatland", yield: 30.5, year: 1932 },
    { site: "MN", variety: "Peatland", yield: 26.7, year: 1931 },
    { site: "MN", variety: "Trebi", yield: 31.6, year: 1932 },
    { site: "MN", variety: "Trebi", yield: 29.3, year: 1931 },
    { site: "MN", variety: "No. 457", yield: 31.9, year: 1932 },
    { site: "MN", variety: "No. 457", yield: 32.3, year: 1931 },
    { site: "MN", variety: "No. 462", yield: 29.9, year: 1932 },
    { site: "MN", variety: "No. 462", yield: 30.7, year: 1931 },
    { site: "MN", variety: "No. 475", yield: 28.1, year: 1932 },
    { site: "MN", variety: "No. 475", yield: 29.1, year: 1931 },
  ]

  // Code from original script before chart initialization:
  /**
   * A recreation of this demo: https://g2plot.antv.antgroup.com/examples/plugin/pattern/#heatmap-cookie-pattern
   */

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
          width: 550,
          height: 500,
          paddingBottom: 80,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        function applyStyle(ctx, style) {
          return Object.entries(style).forEach(([k, v]) => (ctx[k] = v))
        }

        function createCanvas(w, h) {
          const canvas = document.createElement("canvas")
          const dpr = window.devicePixelRatio
          canvas.width = w * dpr
          canvas.height = h * dpr
          canvas.style.width = `${w}px`
          canvas.style.height = `${h}px`
          canvas.getContext("2d").scale(dpr, dpr)

          return canvas
        }

        function drawRect(ctx, w, h, fill) {
          applyStyle(ctx, { fillStyle: fill })
          ctx.fillRect(0, 0, w, h)
        }

        function drawLinePattern(ctx, color, width, height, cross = false) {
          applyStyle(ctx, {
            globalAlpha: 1,
            strokeStyle: color,
            strokeOpacity: 0.9,
          })
          applyStyle(ctx, { lineWidth: 0.5, lineCap: "square" })

          const d = `
               M 0 ${-height} L ${width * 2} ${height}
               M ${-width} ${-height} L ${width} ${height}
               M ${-width} 0 L ${width} ${height * 2}`
          ctx.stroke(new Path2D(d))

          if (cross) {
            const d1 = `
                 M ${-width} ${height} L ${width} ${-height}
                 M ${-width} ${height * 2} L ${width * 2} ${-height}
                 M 0 ${height * 2} L ${width * 2} 0`
            ctx.stroke(new Path2D(d1))
          }
        }

        // create pattern with raw Canvas API
        const createPattern = (
          color,
          stroke,
          cross = false,
          density = false
        ) => {
          const spacing = density ? 3 : 5
          const width = Math.abs(spacing / Math.sin(Math.PI / 4))
          const height = spacing / Math.sin(Math.PI / 4)

          const canvas = createCanvas(width, height)
          const ctx = canvas.getContext("2d")

          drawRect(ctx, width, height, color)
          drawLinePattern(ctx, stroke, width, height, cross)

          return canvas
        }

        const pattern1 = createPattern("#edaa53", "#44120c", true, true)
        const pattern2 = createPattern("#edaa53", "#44120c", true)
        const pattern3 = createPattern("#edaa53", "#fff")

        g2ChartInstance.current
          .cell()
          .data({
            type: "fetch",
            value:
              "https://gw.alipayobjects.com/os/bmw-prod/68d3f380-089e-4683-ab9e-4493200198f9.json",
          })
          .encode("x", "name")
          .encode("y", "country")
          .encode("color", "#edaa53")
          .style("radius", Infinity)
          .style("inset", 1)
          .style("shadowBlur", 10)
          .style("shadowColor", "rgba(0,0,0,0.3)")
          .style("fill", ({ value }) => {
            return {
              image:
                60 <= value && value < 90
                  ? pattern1
                  : value >= 50
                  ? pattern2
                  : pattern3,
              repetition: "repeat",
            }
          })
          .animate("enter", { type: "fadeIn" })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/style/pattern/demo/custom-pattern-with-canvas.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/style/pattern/demo/custom-pattern-with-canvas.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/style/pattern/demo/custom-pattern-with-canvas.ts:",
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
        <CardTitle>Custom Pattern with raw Canvas API</CardTitle>
        <CardDescription>
          G2 Chart. Original example:
          style/pattern/demo/custom-pattern-with-canvas.ts
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
