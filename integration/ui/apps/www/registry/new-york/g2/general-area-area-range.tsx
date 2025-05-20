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

// Original G2 example path: integration/G2/site/examples/general/area/demo/area-range.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_area_area_range() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const data = [
    { time: 1246406400000, temperature: [14.3, 27.7] },
    { time: 1246492800000, temperature: [14.5, 27.8] },
    { time: 1246579200000, temperature: [15.5, 29.6] },
    { time: 1246665600000, temperature: [16.7, 30.7] },
    { time: 1246752000000, temperature: [16.5, 25.0] },
    { time: 1246838400000, temperature: [17.8, 25.7] },
    { time: 1246924800000, temperature: [13.5, 24.8] },
    { time: 1247011200000, temperature: [10.5, 21.4] },
    { time: 1247097600000, temperature: [9.2, 23.8] },
    { time: 1247184000000, temperature: [11.6, 21.8] },
    { time: 1247270400000, temperature: [10.7, 23.7] },
    { time: 1247356800000, temperature: [11.0, 23.3] },
    { time: 1247443200000, temperature: [11.6, 23.7] },
    { time: 1247529600000, temperature: [11.8, 20.7] },
    { time: 1247616000000, temperature: [12.6, 22.4] },
    { time: 1247702400000, temperature: [13.6, 19.6] },
    { time: 1247788800000, temperature: [11.4, 22.6] },
    { time: 1247875200000, temperature: [13.2, 25.0] },
    { time: 1247961600000, temperature: [14.2, 21.6] },
    { time: 1248048000000, temperature: [13.1, 17.1] },
    { time: 1248134400000, temperature: [12.2, 15.5] },
    { time: 1248220800000, temperature: [12.0, 20.8] },
    { time: 1248307200000, temperature: [12.0, 17.1] },
    { time: 1248393600000, temperature: [12.7, 18.3] },
    { time: 1248480000000, temperature: [12.4, 19.4] },
    { time: 1248566400000, temperature: [12.6, 19.9] },
    { time: 1248652800000, temperature: [11.9, 20.2] },
    { time: 1248739200000, temperature: [11.0, 19.3] },
    { time: 1248825600000, temperature: [10.8, 17.8] },
    { time: 1248912000000, temperature: [11.8, 18.5] },
    { time: 1248998400000, temperature: [10.8, 16.1] },
  ]

  const averages = [
    { time: 1246406400000, temperature: 21.5 },
    { time: 1246492800000, temperature: 22.1 },
    { time: 1246579200000, temperature: 23 },
    { time: 1246665600000, temperature: 23.8 },
    { time: 1246752000000, temperature: 21.4 },
    { time: 1246838400000, temperature: 21.3 },
    { time: 1246924800000, temperature: 18.3 },
    { time: 1247011200000, temperature: 15.4 },
    { time: 1247097600000, temperature: 16.4 },
    { time: 1247184000000, temperature: 17.7 },
    { time: 1247270400000, temperature: 17.5 },
    { time: 1247356800000, temperature: 17.6 },
    { time: 1247443200000, temperature: 17.7 },
    { time: 1247529600000, temperature: 16.8 },
    { time: 1247616000000, temperature: 17.7 },
    { time: 1247702400000, temperature: 16.3 },
    { time: 1247788800000, temperature: 17.8 },
    { time: 1247875200000, temperature: 18.1 },
    { time: 1247961600000, temperature: 17.2 },
    { time: 1248048000000, temperature: 14.4 },
    { time: 1248134400000, temperature: 13.7 },
    { time: 1248220800000, temperature: 15.7 },
    { time: 1248307200000, temperature: 14.6 },
    { time: 1248393600000, temperature: 15.3 },
    { time: 1248480000000, temperature: 15.3 },
    { time: 1248566400000, temperature: 15.8 },
    { time: 1248652800000, temperature: 15.2 },
    { time: 1248739200000, temperature: 14.8 },
    { time: 1248825600000, temperature: 14.4 },
    { time: 1248912000000, temperature: 15 },
    { time: 1248998400000, temperature: 13.6 },
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
                type: "map",
                callback: (d) => ({
                  time: d.time,
                  low: d.temperature[0],
                  high: d.temperature[1],
                }),
              },
            ],
          })
          .axis("y", { title: false })

        g2ChartInstance.current
          .area()
          .encode("x", (d) => new Date(d.time).toLocaleDateString())
          .encode("y", ["low", "high"])
          .encode("shape", "area")
          .style("fillOpacity", 0.3)
          .style("fill", "#64b5f6")
          .tooltip({
            items: [(d) => ({ name: "温度区间", value: `${d.low}-${d.high}` })],
          })

        g2ChartInstance.current
          .line()
          .data(averages)
          .encode("x", (d) => new Date(d.time).toLocaleDateString())
          .encode("y", "temperature")
          .encode("shape", "line")
          .style("lineWidth", 2)
          .tooltip({
            title: false,
            items: [
              (d) => ({
                name: "平均温度",
                value: d.temperature,
              }),
            ],
          })
        g2ChartInstance.current
          .point()
          .data(averages)
          .encode("x", (d) => new Date(d.time).toLocaleDateString())
          .encode("y", "temperature")
          .encode("shape", "point")
          .encode("size", 4)
          .tooltip(false)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/area/demo/area-range.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/area/demo/area-range.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/area/demo/area-range.ts:",
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
        <CardTitle>Range Area Chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/area/demo/area-range.ts
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
