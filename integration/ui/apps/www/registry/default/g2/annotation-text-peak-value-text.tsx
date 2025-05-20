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

// Original G2 example path: integration/G2/site/examples/annotation/text/demo/peak-value-text.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_annotation_text_peak_value_text() {
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
          data: [
            { month: "Jan", city: "Tokyo", temperature: 7 },
            { month: "Jan", city: "London", temperature: 3.9 },
            { month: "Feb", city: "Tokyo", temperature: 6.9 },
            { month: "Feb", city: "London", temperature: 4.2 },
            { month: "Mar", city: "Tokyo", temperature: 9.5 },
            { month: "Mar", city: "London", temperature: 5.7 },
            { month: "Apr", city: "Tokyo", temperature: 14.5 },
            { month: "Apr", city: "London", temperature: 8.5 },
            { month: "May", city: "Tokyo", temperature: 18.4 },
            { month: "May", city: "London", temperature: 11.9 },
            { month: "Jun", city: "Tokyo", temperature: 21.5 },
            { month: "Jun", city: "London", temperature: 15.2 },
            { month: "Jul", city: "Tokyo", temperature: 25.2 },
            { month: "Jul", city: "London", temperature: 17 },
            { month: "Aug", city: "Tokyo", temperature: 26.5 },
            { month: "Aug", city: "London", temperature: 16.6 },
            { month: "Sep", city: "Tokyo", temperature: 23.3 },
            { month: "Sep", city: "London", temperature: 14.2 },
            { month: "Oct", city: "Tokyo", temperature: 18.3 },
            { month: "Oct", city: "London", temperature: 10.3 },
            { month: "Nov", city: "Tokyo", temperature: 13.9 },
            { month: "Nov", city: "London", temperature: 6.6 },
            { month: "Dec", city: "Tokyo", temperature: 9.6 },
            { month: "Dec", city: "London", temperature: 4.8 },
          ],
          encode: { x: "month", y: "temperature", color: "city" },
          scale: { x: { range: [0, 1] }, y: { nice: true } },
          axis: { y: { labelFormatter: (d) => d + "°C" } },
          children: [
            { type: "line", encode: { shape: "smooth" } },
            {
              type: "text",
              encode: {
                x: "month",
                y: "temperature",
                text: (d) => `峰值：${d.temperature}`,
              },
              transform: [
                {
                  type: "selectY",
                  groupBy: "color",
                  selector: "max",
                },
              ],
              style: {
                fill: "orange",
                fontSize: 16,
                dy: -15,
              },
              tooltip: false,
            },
            {
              type: "point",
              encode: { x: "month", y: "temperature" },
              transform: [
                {
                  type: "selectY",
                  groupBy: "color",
                  selector: "max",
                },
              ],
              tooltip: false,
            },
          ],
        })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/annotation/text/demo/peak-value-text.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/annotation/text/demo/peak-value-text.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/annotation/text/demo/peak-value-text.ts:",
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
        <CardTitle>Peak Value Annotation</CardTitle>
        <CardDescription>
          G2 Chart. Original example: annotation/text/demo/peak-value-text.ts
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
