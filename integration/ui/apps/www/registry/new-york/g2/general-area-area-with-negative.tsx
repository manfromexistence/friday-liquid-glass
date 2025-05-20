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

// Original G2 example path: integration/G2/site/examples/general/area/demo/area-with-negative.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_area_area_with_negative() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const data = [
    { year: "1996", north: 322, south: 162 },
    { year: "1997", north: 324, south: 90 },
    { year: "1998", north: 329, south: 50 },
    { year: "1999", north: 342, south: 77 },
    { year: "2000", north: 348, south: 35 },
    { year: "2001", north: 334, south: -45 },
    { year: "2002", north: 325, south: -88 },
    { year: "2003", north: 316, south: -120 },
    { year: "2004", north: 318, south: -156 },
    { year: "2005", north: 330, south: -123 },
    { year: "2006", north: 355, south: -88 },
    { year: "2007", north: 366, south: -66 },
    { year: "2008", north: 337, south: -45 },
    { year: "2009", north: 352, south: -29 },
    { year: "2010", north: 377, south: -45 },
    { year: "2011", north: 383, south: -88 },
    { year: "2012", north: 344, south: -132 },
    { year: "2013", north: 366, south: -146 },
    { year: "2014", north: 389, south: -169 },
    { year: "2015", north: 334, south: -184 },
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
        g2ChartInstance.current
          .data({
            value: data,
            transform: [
              {
                type: "fold",
                fields: ["north", "south"],
                key: "type", // key字段
                value: "value", // value字段
              },
            ],
          })
          .encode("x", (d) => d.year)
          .encode("y", "value")
          .encode("color", "type")

        g2ChartInstance.current.area().style("fillOpacity", 0.3)

        g2ChartInstance.current.line().style("strokeWidth", 2).tooltip(false)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/area/demo/area-with-negative.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/area/demo/area-with-negative.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/area/demo/area-with-negative.ts:",
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
        <CardTitle>With Negative Area Chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/area/demo/area-with-negative.ts
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
