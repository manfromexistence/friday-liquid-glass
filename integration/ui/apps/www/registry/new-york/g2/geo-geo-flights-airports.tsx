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

// Original G2 example path: integration/G2/site/examples/geo/geo/demo/flights-airports.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_geo_geo_flights_airports() {
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
        fetch("https://assets.antv.antgroup.com/g2/us-10m.json").then((res) =>
          res.json()
        ),
        fetch("https://assets.antv.antgroup.com/g2/airports.json").then((res) =>
          res.json()
        ),
        fetch("https://assets.antv.antgroup.com/g2/flights-airport.json").then(
          (res) => res.json()
        ),
      ]).then((values) => {
        try {
          const [us, airports, flights] = values
          const states = feature(us, us.objects.states).features
          g2ChartInstance.current = new Chart({
            container: chartRef.current,
            autoFit: true,
          })
          g2ChartInstance.current.theme({
            defaultCategory10: "shadcnPalette",
            defaultCategory20: "shadcnPalette",
          })
          const geoView = g2ChartInstance.current
            .geoView()
            .coordinate({ type: "albersUsa" })
          geoView
            .geoPath()
            .data(states)
            .style("fill", "lightgray")
            .style("stroke", "white")
          geoView
            .point()
            .data(airports)
            .encode("x", "longitude")
            .encode("y", "latitude")
            .encode("color", "gray")
            .encode("shape", "point")
            .encode("size", 1)
          geoView
            .link()
            .data({
              value: flights,
              transform: [
                { type: "filter", callback: (d) => d.origin === "SEA" },
                {
                  type: "join",
                  join: airports,
                  on: ["origin", "iata"],
                  select: ["latitude", "longitude"],
                  as: ["origin_latitude", "origin_longitude"],
                },
                {
                  type: "join",
                  join: airports,
                  on: ["destination", "iata"],
                  select: ["latitude", "longitude"],
                  as: ["dest_latitude", "dest_longitude"],
                },
              ],
            })
            .encode("x", ["origin_longitude", "dest_longitude"])
            .encode("y", ["origin_latitude", "dest_latitude"])
            .style("stroke", "black")
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
        <CardTitle>Flights and Airports</CardTitle>
        <CardDescription>
          G2 Chart. Original example: geo/geo/demo/flights-airports.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
