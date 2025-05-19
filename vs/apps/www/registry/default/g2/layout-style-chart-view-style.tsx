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

// Original G2 example path: integration/G2/site/examples/layout/style/demo/chart-view-style.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_layout_style_chart_view_style() {
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
          viewStyle: {
            // 配置图表的视图区域的样式
            viewFill: "#DCEEFE",
            viewRadius: 20,

            // 配置图表的绘制区域的样式
            plotFill: "#fff",
            plotFillOpacity: 0.45,
            plotStroke: "yellow",
            plotLineWidth: 4,

            // 配置图表的主区域的样式
            mainFill: "l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff",
            mainFillOpacity: 0.75,

            // 配置图表的内容区域的样式
            contentFill: "l(90) 0:#ffadad 0.5:#ffd6a5 1:#fdffb6",
            contentShadowColor: "#5d5d5d",
            contentShadowBlur: 40,
            contentShadowOffsetX: 5,
            contentShadowOffsetY: 5,
          },
          type: "area",
          data: {
            type: "fetch",
            value: "https://assets.antv.antgroup.com/g2/aapl.json",
          },
          encode: {
            x: (d) => new Date(d.date),
            y: "close",
          },
          axis: false,
          style: {
            fill: "l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff",
            fillOpacity: 0.9,
          },
          height: 350,
          width: 700,
          margin: 30,
          padding: 20,
          inset: 15,
          legend: false,
        })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/layout/style/demo/chart-view-style.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/layout/style/demo/chart-view-style.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/layout/style/demo/chart-view-style.ts:",
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
        <CardTitle>chart View Style</CardTitle>
        <CardDescription>
          G2 Chart. Original example: layout/style/demo/chart-view-style.ts
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
