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

// Original G2 example path: integration/G2/site/examples/interesting/interesting/demo/25d-column.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_interesting_interesting_25d_column() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  register("shape.interval.column25d", myColumn)

  const data = [
    { year: "1951 年", sales: 38 },
    { year: "1952 年", sales: 52 },
    { year: "1956 年", sales: 61 },
    { year: "1957 年", sales: 145 },
    { year: "1958 年", sales: 48 },
    { year: "1959 年", sales: 38 },
    { year: "1960 年", sales: 38 },
    { year: "1962 年", sales: 38 },
    { year: "1963 年", sales: 65 },
    { year: "1964 年", sales: 122 },
    { year: "1967 年", sales: 132 },
    { year: "1968 年", sales: 144 },
  ]

  // Trailing helpers extracted from original:

  /**
   * Draw 2.5d column shape.
   */
  function myColumn({ fill, stroke }, context) {
    return (points) => {
      const x3 = points[1][0] - points[0][0]
      const x4 = x3 / 2 + points[0][0]
      const { document } = context
      const g = document.createElement("g", {})

      const r = document.createElement("polygon", {
        style: {
          points: [
            [points[0][0], points[0][1]],
            [x4, points[1][1] + 8],
            [x4, points[3][1] + 8],
            [points[3][0], points[3][1]],
          ],
          fill: "rgba(114, 177, 207, 0.5)",
          stroke: "rgba(0,0,0,0.1)",
          strokeOpacity: 0.1,
          inset: 30,
        },
      })

      const p = document.createElement("polygon", {
        style: {
          points: [
            [x4, points[1][1] + 8],
            [points[1][0], points[1][1]],
            [points[2][0], points[2][1]],
            [x4, points[2][1] + 8],
          ],
          fill: "rgba(126, 212, 236, 0.5)",
          stroke: "rgba(0,0,0,0.3)",
          strokeOpacity: 0.1,
        },
      })

      const t = document.createElement("polygon", {
        style: {
          points: [
            [points[0][0], points[0][1]],
            [x4, points[1][1] - 8],
            [points[1][0], points[1][1]],
            [x4, points[1][1] + 8],
          ],
          fill: "rgba(173, 240, 255, 0.65)",
        },
      })

      g.appendChild(r)
      g.appendChild(p)
      g.appendChild(t)

      return g
    }
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
          autoFit: true,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current.data(data)

        g2ChartInstance.current
          .interval()
          .encode("x", "year")
          .encode("y", "sales")
          .style("shape", "column25d")
          .scale("x", { padding: 0.3 })

        g2ChartInstance.current.legend("year", {
          width: 10,
        })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/interesting/interesting/demo/25d-column.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/interesting/interesting/demo/25d-column.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/interesting/interesting/demo/25d-column.ts:",
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
        <CardTitle>2.5D Column</CardTitle>
        <CardDescription>
          G2 Chart. Original example: interesting/interesting/demo/25d-column.ts
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
