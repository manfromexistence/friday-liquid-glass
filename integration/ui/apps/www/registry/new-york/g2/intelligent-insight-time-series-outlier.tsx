// @ts-nocheck
"use client"

import React, { useEffect, useRef } from "react"
import { Chart, register } from "@antv/g2"
import { TimeSeriesOutlier } from "@antv/g2-extension-ava"

import { useShadcnChartColors } from "@/hooks/use-shadcn-chart-colors"
// Import the hook
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"

// Original G2 example path: integration/G2/site/examples/intelligent/insight/demo/time-series-outlier.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_intelligent_insight_time_series_outlier() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  /**
   * AVA: https://github.com/antvis/AVA
   * g2-extension-ava: https://github.com/antvis/g2-extensions/tree/master/ava
   */

  const data = [
    {
      date: "2001",
      discount_price: 727.12,
    },
    {
      date: "2002",
      discount_price: 729.59,
    },
    {
      date: "2003",
      discount_price: 730.21,
    },
    {
      date: "2004",
      discount_price: 732.11,
    },
    {
      date: "2005",
      discount_price: 733.22,
    },
    {
      date: "2006",
      discount_price: 741.19,
    },
    {
      date: "2007",
      discount_price: 742.37,
    },
    {
      date: "2008",
      discount_price: 752.34,
    },
    {
      date: "2009",
      discount_price: 761.12,
    },
    {
      date: "2010",
      discount_price: 783.99,
    },
    {
      date: "2011",
      discount_price: 791.23,
    },
    {
      date: "2012",
      discount_price: 781.99,
    },
    {
      date: "2013",
      discount_price: 835.71,
    },
    {
      date: "2014",
      discount_price: 839.24,
    },
    {
      date: "2015",
      discount_price: 883.51,
    },
    {
      date: "2016",
      discount_price: 873.98,
    },
    {
      date: "2017",
      discount_price: 802.78,
    },
    {
      date: "2018",
      discount_price: 807.05,
    },
    {
      date: "2019",
      discount_price: 885.12,
    },
    {
      date: "2020",
      discount_price: 1018.85,
    },
    {
      date: "2021",
      discount_price: 934.49,
    },
    {
      date: "2022",
      discount_price: 908.74,
    },
    {
      date: "2023",
      discount_price: 930.55,
    },
    {
      date: "2024",
      discount_price: 978.53,
    },
    {
      date: "2025",
      discount_price: 931.47,
    },
    {
      date: "2026",
      discount_price: 891,
    },
    {
      date: "2027",
      discount_price: 836.41,
    },
    {
      date: "2028",
      discount_price: 826.11,
    },
    {
      date: "2029",
      discount_price: 820.11,
    },
    {
      date: "2030",
      discount_price: 811.11,
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

        g2ChartInstance.current.mark(TimeSeriesOutlier)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/intelligent/insight/demo/time-series-outlier.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/intelligent/insight/demo/time-series-outlier.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/intelligent/insight/demo/time-series-outlier.ts:",
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
        <CardTitle>Time Series Outlier</CardTitle>
        <CardDescription>
          G2 Chart. Original example:
          intelligent/insight/demo/time-series-outlier.ts
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
