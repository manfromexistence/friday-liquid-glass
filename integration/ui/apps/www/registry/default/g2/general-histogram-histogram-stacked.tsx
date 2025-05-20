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

// Original G2 example path: integration/G2/site/examples/general/histogram/demo/histogram-stacked.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_histogram_histogram_stacked() {
  const chartRef = useRef<HTMLDivElement>(null)
  const g2ChartInstance = useRef<Chart | null>(null)
  const shadcnColors = useShadcnChartColors(chartRef) // Use the hook

  useEffect(() => {
    if (shadcnColors && shadcnColors.length === 5) {
      try {
        register("palette.shadcnPalette", () => shadcnColors)
      } catch (e) {
        register("palette.shadcnPalette", () =>
          JSON.parse('["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]')
        )
      }
    } else {
      register("palette.shadcnPalette", () =>
        JSON.parse('["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]')
      )
    }
    if (chartRef.current && !g2ChartInstance.current) {
      fetch("https://assets.antv.antgroup.com/g2/iris.json")
        .then((res) => res.json())
        .then((data) => {
          try {
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
              .transform({
                type: "binX",
                x: "sepalLength",
                groupBy: ["species"],
              })
              .encode("x", "bin")
              .encode("y", "count")
              .encode("color", "species")
              .transform({ type: "stackY" })
            g2ChartInstance.current.render()
          } catch (error) {
            if (chartRef.current) {
              chartRef.current.innerHTML =
                '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart.</div>'
            }
          }
        })
    }
    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch {}
        g2ChartInstance.current = null
      }
    }
  }, [shadcnColors])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Histogram Stacked</CardTitle>
        <CardDescription>
          G2 Chart. Original example:
          general/histogram/demo/histogram-stacked.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
