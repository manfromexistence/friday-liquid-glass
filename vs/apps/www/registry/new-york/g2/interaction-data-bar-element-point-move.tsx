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

// Original G2 example path: integration/G2/site/examples/interaction/data/demo/bar-element-point-move.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_interaction_data_bar_element_point_move() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const data = [
    { name: "London", 月份: "Jan.", 月均降雨量: 18.9 },
    { name: "London", 月份: "Feb.", 月均降雨量: 28.8 },
    { name: "London", 月份: "Mar.", 月均降雨量: 39.3 },
    { name: "London", 月份: "Apr.", 月均降雨量: 81.4 },
    { name: "London", 月份: "May", 月均降雨量: 47 },
    { name: "London", 月份: "Jun.", 月均降雨量: 20.3 },
    { name: "London", 月份: "Jul.", 月均降雨量: 24 },
    { name: "London", 月份: "Aug.", 月均降雨量: 35.6 },
    { name: "Berlin", 月份: "Jan.", 月均降雨量: 12.4 },
    { name: "Berlin", 月份: "Feb.", 月均降雨量: 23.2 },
    { name: "Berlin", 月份: "Mar.", 月均降雨量: 34.5 },
    { name: "Berlin", 月份: "Apr.", 月均降雨量: 99.7 },
    { name: "Berlin", 月份: "May", 月均降雨量: 52.6 },
    { name: "Berlin", 月份: "Jun.", 月均降雨量: 35.5 },
    { name: "Berlin", 月份: "Jul.", 月均降雨量: 37.4 },
    { name: "Berlin", 月份: "Aug.", 月均降雨量: 42.4 },
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
          .interval()
          .data(data)
          .encode("x", "月份")
          .encode("y", "月均降雨量")
          .encode("color", "name")
          .encode("key", (d) => d["name"] + d["月份"])
          .interaction({
            legendFilter: false,
            elementPointMove: {
              precision: 3,
            },
          })
          .transform({ type: "stackY" })
          .coordinate({ transform: [{ type: "transpose" }] })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/interaction/data/demo/bar-element-point-move.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/interaction/data/demo/bar-element-point-move.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/interaction/data/demo/bar-element-point-move.ts:",
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
        <CardTitle>Bar Numerical Interaction</CardTitle>
        <CardDescription>
          G2 Chart. Original example:
          interaction/data/demo/bar-element-point-move.ts
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
