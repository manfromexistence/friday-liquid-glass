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

// Original G2 example path: integration/G2/site/examples/geo/geo/demo/choropleth-usa.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_geo_geo_choropleth_usa() {
  const chartRef = useRef<HTMLDivElement>(null)
  const g2ChartInstance = useRef<Chart | null>(null)
  const shadcnColors = useShadcnChartColors(chartRef)

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
      fetch("https://assets.antv.antgroup.com/g2/unemployment2.json")
        .then((res) => res.json())
        .then((data) => {
          try {
            register("data.feature", ({ name }) => {
              return (data) => feature(data, data.objects[name]).features
            })
            g2ChartInstance.current = new Chart({
              container: chartRef.current,
              autoFit: true,
            })
            g2ChartInstance.current.theme({
              defaultCategory10: "shadcnPalette",
              defaultCategory20: "shadcnPalette",
            })
            g2ChartInstance.current
              .geoPath()
              .coordinate({ type: "albersUsa" })
              .data({
                type: "fetch",
                value: "https://assets.antv.antgroup.com/g2/us-10m.json",
                transform: [
                  { type: "feature", name: "counties" },
                  {
                    type: "join",
                    join: data,
                    on: ["id", "id"],
                    select: ["rate"],
                  },
                ],
              })
              .scale("color", {
                palette: "ylGnBu",
                unknown: "#fff",
              })
              .encode("color", "rate")
              .legend({ color: { layout: { justifyContent: "center" } } })
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
        <CardTitle>USA Choropleth</CardTitle>
        <CardDescription>
          G2 Chart. Original example: geo/geo/demo/choropleth-usa.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
