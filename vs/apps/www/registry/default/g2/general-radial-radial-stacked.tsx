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

// Original G2 example path: integration/G2/site/examples/general/radial/demo/radial-stacked.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_radial_radial_stacked() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const data = [
    { State: "WY", 小于5岁: 25635, "5至13岁": 1890, "14至17岁": 9314 },
    { State: "DC", 小于5岁: 30352, "5至13岁": 20439, "14至17岁": 10225 },
    { State: "VT", 小于5岁: 38253, "5至13岁": 42538, "14至17岁": 15757 },
    { State: "ND", 小于5岁: 51896, "5至13岁": 67358, "14至17岁": 18794 },
    { State: "AK", 小于5岁: 72083, "5至13岁": 85640, "14至17岁": 22153 },
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
        g2ChartInstance.current.coordinate({ type: "radial" })

        g2ChartInstance.current
          .interval()
          .data({
            value: data,
            transform: [
              {
                type: "fold",
                fields: ["小于5岁", "5至13岁", "14至17岁"],
                key: "年龄段",
                value: "人口数量",
                retains: ["State"],
              },
            ],
          })
          .encode("x", "State")
          .encode("y", "人口数量")
          .encode("color", "年龄段")
          .scale("y", { domainMax: 200000 })
          .scale("color", { range: ["#6395FA", "#62DAAB", "#657798"] })
          .transform({ type: "stackY" })
          .axis({
            x: {
              title: false,
              line: true,
            },
            y: {
              line: true,
              grid: true,
              gridLineDash: [4, 4],
              tickCount: 10,
              tickFilter: (datum) => datum != 200000,
            },
          })
          .legend({
            color: {
              position: "bottom",
              layout: { justifyContent: "center" },
            },
          })
          .interaction("elementHighlightByX")
          .interaction("tooltip", {
            shared: true,
          })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/radial/demo/radial-stacked.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/radial/demo/radial-stacked.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/radial/demo/radial-stacked.ts:",
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
        <CardTitle>Radial stacked bar chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/radial/demo/radial-stacked.ts
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
