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

// Original G2 example path: integration/G2/site/examples/general/line/demo/line-threshold.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_line_line_threshold() {
  const chartRef = useRef<HTMLDivElement>(null)
  const g2ChartInstance = useRef<Chart | null>(null)
  const shadcnColors = useShadcnChartColors(chartRef) // Use the hook

  useEffect(() => {
    if (shadcnColors && shadcnColors.length === 5) {
      try {
        register("palette.shadcnPalette", () => shadcnColors)
      } catch (e) {
        register("palette.shadcnPalette", () =>
          JSON.parse(FALLBACK_COLORS_JSON)
        )
      }
    } else {
      register("palette.shadcnPalette", () => JSON.parse(FALLBACK_COLORS_JSON))
    }
    if (chartRef.current && !g2ChartInstance.current) {
      fetch("https://assets.antv.antgroup.com/g2/temperatures2.json")
        .then((res) => res.json())
        .then((data) => {
          const median = (arr, accessor) => {
            const values = arr.map(accessor).sort((a, b) => a - b)
            const mid = Math.floor(values.length / 2)
            return values.length % 2 !== 0
              ? values[mid]
              : (values[mid - 1] + values[mid]) / 2
          }
          const medianValue = median(data, (d) => d.value)
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
              .line()
              .data(data)
              .encode("x", "date")
              .encode("y", "value")
              .encode("color", (d) =>
                d.value >= medianValue ? "Above Median" : "Below Median"
              )
              .scale("color", {
                domain: ["Above Median", "Below Median"],
                range: ["#e41a1c", "#377eb8"],
              })
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
        <CardTitle>Line Threshold</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/line/demo/line-threshold.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
