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

// Original G2 example path: integration/G2/site/examples/geo/geo/demo/london-tube-lines.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_geo_geo_london_tube_lines() {
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
      Promise.all([
        fetch("https://assets.antv.antgroup.com/g2/londonBoroughs.json").then(
          (res) => res.json()
        ),
        fetch("https://assets.antv.antgroup.com/g2/londonCentroids.json").then(
          (res) => res.json()
        ),
        fetch("https://assets.antv.antgroup.com/g2/londonTubeLines.json").then(
          (res) => res.json()
        ),
      ]).then((values) => {
        try {
          const [londonBoroughs, londonCentroids, londonTubeLines] = values
          const london = feature(
            londonBoroughs,
            londonBoroughs.objects.boroughs
          ).features
          const line = feature(
            londonTubeLines,
            londonTubeLines.objects.line
          ).features
          g2ChartInstance.current = new Chart({
            container: chartRef.current,
            autoFit: true,
          })
          g2ChartInstance.current.theme({
            defaultCategory10: "shadcnPalette",
            defaultCategory20: "shadcnPalette",
          })
          const geoView = g2ChartInstance.current.geoView()
          geoView
            .geoPath()
            .data(london)
            .style("fill", "lightgray")
            .style("stroke", "white")
            .style("lineWidth", 2)
          geoView
            .text()
            .data(londonCentroids)
            .encode("x", "cx")
            .encode("y", "cy")
            .encode("text", (d) => d.name.split(/\W/)[0])
            .style("fontSize", 8)
            .style("opacity", 0.6)
          geoView
            .geoPath()
            .data(line)
            .encode("color", "id")
            .encode("shape", "hollow")
            .scale("color", {
              domain: [
                "Bakerloo",
                "Central",
                "Circle",
                "District",
                "DLR",
                "Hammersmith & City",
                "Jubilee",
                "Metropolitan",
                "Northern",
                "Piccadilly",
                "Victoria",
                "Waterloo & City",
              ],
              range: [
                "rgb(137,78,36)",
                "rgb(220,36,30)",
                "rgb(255,206,0)",
                "rgb(1,114,41)",
                "rgb(0,175,173)",
                "rgb(215,153,175)",
                "rgb(106,114,120)",
                "rgb(114,17,84)",
                "rgb(0,0,0)",
                "rgb(0,24,168)",
                "rgb(0,160,226)",
                "rgb(106,187,170)",
              ],
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
        <CardTitle>London Tube line</CardTitle>
        <CardDescription>
          G2 Chart. Original example: geo/geo/demo/london-tube-lines.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
