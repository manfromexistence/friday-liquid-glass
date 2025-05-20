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

// Original G2 example path: integration/G2/site/examples/general/area/demo/rank-trend-area.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_area_rank_trend_area() {
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
        g2ChartInstance.current = new Chart({ container: chartRef.current })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current.options({
          type: "view",
          autoFit: true,
          paddingRight: 10,
          data: [
            { month: "一月", rank: 200 },
            { month: "二月", rank: 160 },
            { month: "三月", rank: 100 },
            { month: "四月", rank: 80 },
            { month: "五月", rank: 99 },
            { month: "六月", rank: 36 },
            { month: "七月", rank: 40 },
            { month: "八月", rank: 20 },
            { month: "九月", rank: 12 },
            { month: "十月", rank: 15 },
            { month: "十一月", rank: 6 },
            { month: "十二月", rank: 1 },
          ],
          scale: {
            y: {
              nice: true,
              tickMethod: () => [0, 50, 100, 170, 199],
            },
          },
          axis: {
            y: {
              labelFormatter: (d) => `第${200 - d}名`,
            },
          },
          children: [
            {
              type: "area",
              encode: {
                x: (d) => d.month,
                y: (d) => 200 - d.rank,
                shape: "smooth",
              },
              style: { opacity: 0.2 },
              axis: { y: { labelFormatter: "~s", title: false } },
              style: {
                fill: "l(270) 0:#ffffff 0.9:#7ec2f3 1:#1890ff",
                fillOpacity: 0.2,
              },
              tooltip: false,
            },
            {
              type: "line",
              encode: {
                x: (d) => d.month,
                y: (d) => 200 - d.rank,
                shape: "smooth",
              },
              interaction: {
                tooltip: {
                  render: (event, { title, items }) => `
        <div style="display: flex; align-items: center;">
          <span>${title}：第</span>
          <h2
            style="
                margin-left: 8px;
                margin-right: 8px;
                margin-top:4px;
                font-size: 18px;
                line-height: 36px;
                font-weight: 500px"
          >
            ${200 - items[0].value}
          </h2>
          <span>名</span>
        </div>
                  `,
                },
              },
              style: {
                lineWidth: 2,
              },
            },
          ],
        })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/area/demo/rank-trend-area.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/area/demo/rank-trend-area.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/area/demo/rank-trend-area.ts:",
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
        <CardTitle>Rank Trend Area Chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/area/demo/rank-trend-area.ts
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
