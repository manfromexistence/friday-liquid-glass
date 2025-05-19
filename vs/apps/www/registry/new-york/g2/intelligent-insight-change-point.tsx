// @ts-nocheck
"use client"

import React, { useEffect, useRef } from "react"
import { Chart, register } from "@antv/g2"
import { ChangePoint } from "@antv/g2-extension-ava"

import { useShadcnChartColors } from "@/hooks/use-shadcn-chart-colors"
// Import the hook
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"

// Original G2 example path: integration/G2/site/examples/intelligent/insight/demo/change-point.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_intelligent_insight_change_point() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  /**
   * AVA: https://github.com/antvis/AVA
   * g2-extension-ava: https://github.com/antvis/g2-extensions/tree/master/ava
   */

  const data = [
    {
      date: "2000",
      discount_price: 43.37,
    },
    {
      date: "2001",
      discount_price: 29.34,
    },
    {
      date: "2002",
      discount_price: 49.12,
    },
    {
      date: "2003",
      discount_price: 56.99,
    },
    {
      date: "2004",
      discount_price: 61.23,
    },
    {
      date: "2005",
      discount_price: 781.99,
    },
    {
      date: "2006",
      discount_price: 895.71,
    },
    {
      date: "2007",
      discount_price: 789.24,
    },
    {
      date: "2008",
      discount_price: 793.51,
    },
    {
      date: "2009",
      discount_price: 783.98,
    },
    {
      date: "2010",
      discount_price: 782.78,
    },
    {
      date: "2011",
      discount_price: 797.05,
    },
    {
      date: "2012",
      discount_price: 785.12,
    },
    {
      date: "2013",
      discount_price: 798.85,
    },
    {
      date: "2014",
      discount_price: 734.49,
    },
    {
      date: "2015",
      discount_price: 708.74,
    },
    {
      date: "2016",
      discount_price: 730.55,
    },
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
          .data(data)
          .encode("x", "date")
          .encode("y", "discount_price")

        g2ChartInstance.current.line()

        g2ChartInstance.current.mark(ChangePoint)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/intelligent/insight/demo/change-point.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/intelligent/insight/demo/change-point.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/intelligent/insight/demo/change-point.ts:",
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
        <CardTitle>Change Point</CardTitle>
        <CardDescription>
          G2 Chart. Original example: intelligent/insight/demo/change-point.ts
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
