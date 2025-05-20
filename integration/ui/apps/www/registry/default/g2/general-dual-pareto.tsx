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

// Original G2 example path: integration/G2/site/examples/general/dual/demo/pareto.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_dual_pareto() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const data = [
    { x: "Parking Difficult", value: 95 },
    { x: "Sales Rep was Rude", value: 60 },
    { x: "Poor Lighting", value: 45 },
    { x: "Layout Confusing", value: 37 },
    { x: "Sizes Limited", value: 30 },
    { x: "Clothing Faded", value: 27 },
    { x: "Clothing Shrank", value: 18 },
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
        g2ChartInstance.current.title("Pareto Chart of Customer Complaints")

        g2ChartInstance.current.data({
          type: "inline",
          value: data,
          transform: [
            {
              type: "custom",
              // calucate accumulate and percentage fields.
              callback: (data) => {
                const sum = data.reduce((r, curr) => r + curr.value, 0)
                return data
                  .map((d) => ({ ...d, percentage: d.value / sum }))
                  .reduce((r, curr) => {
                    const v = r.length ? r[r.length - 1].accumulate : 0
                    const accumulate = v + curr.percentage
                    r.push({ ...curr, accumulate })
                    return r
                  }, [])
              },
            },
          ],
        })

        g2ChartInstance.current
          .interval()
          .encode("x", "x")
          .encode("y", "value")
          .style("fill", (d) => (d.percentage < 0.1 ? "#E24B26" : "#78B3F0"))
          .scale("x", { padding: 1 / 2 })
          .scale("y", { domainMax: 312, tickCount: 5 })
          .axis("x", { title: null })
          .axis("y", { title: "Defect frequency" })
          .label({
            text: (d) => `${(d.percentage * 100).toFixed(1)}%`,
            textBaseline: "bottom",
          })

        g2ChartInstance.current
          .line()
          .encode("x", "x")
          .encode("y", "accumulate")
          .scale("y", { independent: true, domainMin: 0, tickCount: 5 })
          .axis("y", {
            position: "right",
            title: "Cumulative Percentage",
            grid: null,
            labelFormatter: (d) => `${(d * 100).toFixed(0)}%`,
          })
          .tooltip({
            channel: "y",
            valueFormatter: (d) => `${(d * 100).toFixed(2)}%`,
          })

        g2ChartInstance.current
          .point()
          .encode("x", "x")
          .encode("y", "accumulate")
          .encode("shape", "diamond")
          .scale("y", { independent: true, domainMin: 0 })
          .axis("y", null)
          .tooltip(null)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/dual/demo/pareto.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/dual/demo/pareto.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/dual/demo/pareto.ts:",
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
        <CardTitle>Pareto Chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/dual/demo/pareto.ts
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
