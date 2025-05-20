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

// Original G2 example path: integration/G2/site/examples/annotation/shape/demo/watermark.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_annotation_shape_watermark() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Default data used as a fallback because no specific data source was detected:
  const data = [
    { site: "MN", variety: "Manchuria", yield: 32.4, year: 1932 },
    { site: "MN", variety: "Manchuria", yield: 30.7, year: 1931 },
    { site: "MN", variety: "Glabron", yield: 33.1, year: 1932 },
    { site: "MN", variety: "Glabron", yield: 33, year: 1931 },
    { site: "MN", variety: "Svansota", yield: 29.3, year: 1932 },
    { site: "MN", variety: "Svansota", yield: 30.8, year: 1931 },
    { site: "MN", variety: "Velvet", yield: 32, year: 1932 },
    { site: "MN", variety: "Velvet", yield: 33.3, year: 1931 },
    { site: "MN", variety: "Peatland", yield: 30.5, year: 1932 },
    { site: "MN", variety: "Peatland", yield: 26.7, year: 1931 },
    { site: "MN", variety: "Trebi", yield: 31.6, year: 1932 },
    { site: "MN", variety: "Trebi", yield: 29.3, year: 1931 },
    { site: "MN", variety: "No. 457", yield: 31.9, year: 1932 },
    { site: "MN", variety: "No. 457", yield: 32.3, year: 1931 },
    { site: "MN", variety: "No. 462", yield: 29.9, year: 1932 },
    { site: "MN", variety: "No. 462", yield: 30.7, year: 1931 },
    { site: "MN", variety: "No. 475", yield: 28.1, year: 1932 },
    { site: "MN", variety: "No. 475", yield: 29.1, year: 1931 },
  ]

  // Trailing helpers extracted from original:

  function watermark({ x, y }, context) {
    const { document } = context

    const g = document.createElement("g", {})
    const c1 = document.createElement("circle", {
      style: {
        cx: x,
        cy: y,
        lineWidth: 4,
        r: 65,
        stroke: "red",
        opacity: 0.3,
      },
    })
    const c2 = document.createElement("circle", {
      style: {
        cx: x,
        cy: y,
        lineWidth: 2,
        r: 50,
        stroke: "red",
        opacity: 0.3,
      },
    })

    const text = document.createElement("text", {
      style: {
        x,
        y,
        text: "数据保密",
        transformOrigin: "center",
        transform: "rotate(30)",
        fontSize: 20,
        fill: "red",
        textAlign: "center",
        textBaseline: "middle",
        fillOpacity: 0.3,
      },
    })

    g.appendChild(c1)
    g.appendChild(c2)
    g.appendChild(text)
    return g
  }

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
          .data([
            { month: "Jan.", profit: 387264, start: 0, end: 387264 },
            { month: "Feb.", profit: 772096, start: 387264, end: 1159360 },
            { month: "Mar.", profit: 638075, start: 1159360, end: 1797435 },
            { month: "Apr.", profit: -211386, start: 1797435, end: 1586049 },
            { month: "May", profit: -138135, start: 1586049, end: 1447914 },
            { month: "Jun", profit: -267238, start: 1447914, end: 1180676 },
            { month: "Jul.", profit: 431406, start: 1180676, end: 1612082 },
            { month: "Aug.", profit: 363018, start: 1612082, end: 1975100 },
            { month: "Sep.", profit: -224638, start: 1975100, end: 1750462 },
            { month: "Oct.", profit: -299867, start: 1750462, end: 1450595 },
            { month: "Nov.", profit: 607365, start: 1450595, end: 2057960 },
            { month: "Dec.", profit: 1106986, start: 2057960, end: 3164946 },
            { month: "Total", start: 0, end: 3164946 },
          ])
          .encode("x", "month")
          .encode("y", ["end", "start"])
          .encode("color", (d) =>
            d.month === "Total"
              ? "Total"
              : d.profit > 0
              ? "Increase"
              : "Decrease"
          )
          .axis("y", { labelFormatter: "~s" })
          .tooltip({ channel: "y", valueFormatter: "~s" })
          .tooltip({ channel: "y1", valueFormatter: "~s" })

        g2ChartInstance.current
          .shape()
          .style("x", "80%")
          .style("y", "70%")
          .style("render", watermark)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/annotation/shape/demo/watermark.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/annotation/shape/demo/watermark.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/annotation/shape/demo/watermark.ts:",
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
        <CardTitle>Watermark</CardTitle>
        <CardDescription>
          G2 Chart. Original example: annotation/shape/demo/watermark.ts
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
