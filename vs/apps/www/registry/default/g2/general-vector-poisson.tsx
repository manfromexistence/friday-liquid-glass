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

// Original G2 example path: integration/G2/site/examples/general/vector/demo/poisson.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_vector_poisson() {
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
      try {
        g2ChartInstance.current = new Chart({
          container: chartRef.current,
          autoFit: true,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        fetch(
          "https://gw.alipayobjects.com/os/antfincdn/OJOgPypkeE/poisson-disk.json"
        )
          .then((res) => res.json())
          .then((poisson) => {
            g2ChartInstance.current
              .vector()
              .data(poisson)
              .encode("x", "x")
              .encode("y", "y")
              .encode("u", "u")
              .encode("v", "v")
              .encode("color", "u")
              .scale("color", { palette: "blues" })
            g2ChartInstance.current.render()
          })
      } catch (error) {
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart.</div>'
        }
      }
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
        <CardTitle>Poisson Vector Field</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/vector/demo/poisson.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
