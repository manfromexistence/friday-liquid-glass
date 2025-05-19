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

// Original G2 example path: integration/G2/site/examples/general/candlestick/demo/k-and-column.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_candlestick_k_and_column() {
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

  // Code from original script before chart initialization:
  document.getElementById("container").innerHTML = `
    <div id="kChart" ></div>
    <div id="columnChart"></div>
  `

  // Trailing helpers extracted from original:
  ColumnChart.render()

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
          height: 360,
          paddingLeft: 60,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current
          .data({
            type: "fetch",
            value:
              "https://gw.alipayobjects.com/os/antvdemo/assets/data/candle-sticks.json",
          })
          .encode("x", "time")
          .encode("color", (d) => {
            const trend = Math.sign(d.start - d.end)
            return trend > 0 ? "下跌" : trend === 0 ? "不变" : "上涨"
          })
          .scale("x", {
            compare: (a, b) => new Date(a).getTime() - new Date(b).getTime(),
          })
          .scale("color", {
            domain: ["下跌", "不变", "上涨"],
            range: ["#4daf4a", "#999999", "#e41a1c"],
          })

        g2ChartInstance.current
          .link()
          .encode("y", ["min", "max"])
          .tooltip({
            title: "time",
            items: [
              { field: "start", name: "开盘价" },
              { field: "end", name: "收盘价" },
              { field: "min", name: "最低价" },
              { field: "max", name: "最高价" },
            ],
          })

        g2ChartInstance.current
          .interval()
          .encode("y", ["start", "end"])
          .style("fillOpacity", 1)
          .style("stroke", (d) => {
            if (d.start === d.end) return "#999999"
          })
          .axis("x", {
            title: false,
          })
          .axis("y", {
            title: false,
          })
          .tooltip({
            title: "time",
            items: [
              { field: "start", name: "开盘价" },
              { field: "end", name: "收盘价" },
              { field: "min", name: "最低价" },
              { field: "max", name: "最高价" },
            ],
          })

        const ColumnChart = new Chart({
          container: "columnChart",
          autoFit: true,
          paddingTop: 0,
          paddingBottom: 0,
          height: 180,
          paddingLeft: 60,
        })

        ColumnChart.data({
          type: "fetch",
          value:
            "https://gw.alipayobjects.com/os/antvdemo/assets/data/candle-sticks.json",
        })

        ColumnChart.interval()
          .encode("x", "time")
          .encode("y", "volumn")
          .encode("color", (d) => {
            const trend = Math.sign(d.start - d.end)
            return trend > 0 ? "下跌" : trend === 0 ? "不变" : "上涨"
          })
          .scale("x", {
            compare: (a, b) => new Date(a).getTime() - new Date(b).getTime(),
          })
          .scale("color", {
            domain: ["下跌", "不变", "上涨"],
            range: ["#4daf4a", "#999999", "#e41a1c"],
          })
          .axis("x", false)
          .axis("y", {
            title: false,
          })

        g2ChartInstance.current.on("legend:filter", (e) => {
          const { nativeEvent, data } = e
          if (!nativeEvent) return
          ColumnChart.emit("legend:filter", { data })
        })

        g2ChartInstance.current.on("legend:reset", (e) => {
          const { nativeEvent, data } = e
          if (!nativeEvent) return
          ColumnChart.emit("legend:reset", { data })
        })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/candlestick/demo/k-and-column.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/candlestick/demo/k-and-column.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/candlestick/demo/k-and-column.ts:",
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
        <CardTitle>Candlestick chart and column chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/candlestick/demo/k-and-column.ts
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
