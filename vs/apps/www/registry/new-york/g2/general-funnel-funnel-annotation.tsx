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

// Original G2 example path: integration/G2/site/examples/general/funnel/demo/funnel-annotation.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_funnel_funnel_annotation() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const r = (start, end) => `${(((start - end) / start) * 100).toFixed(2)} %`

  const data = [
    { text: "A", value: 12000 },
    { text: "B", value: 9800 },
    { text: "C", value: 6789 },
    { text: "D", value: 4569 },
  ]
  const encodeX = "text"
  const encodeY = "value"

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
          paddingRight: 60,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current.coordinate({
          transform: [{ type: "transpose" }],
        })

        g2ChartInstance.current
          .interval()
          .data(data)
          .transform({ type: "symmetryY" })
          .axis(false)
          .legend(false)
          .encode("x", encodeX)
          .encode("y", encodeY)
          .encode("color", encodeX)
          .encode("shape", "funnel")
          .scale("x", { paddingOuter: 0, paddingInner: 0 })
          .label({
            text: (d) => `${d[encodeX]} ${d[encodeY]}`,
            position: "inside",
            fontSize: 20,
          })
          .label({
            text: "",
            // Use div to mock a line.
            render: (d, data, i) =>
              i !== 0
                ? `<div style="height:1px;width:30px;background:#aaa;margin:0 20px;"></div>`
                : "",
            position: "top-right",
          })
          .label({
            text: (d, i) => (i !== 0 ? "转换率" : ""),
            position: "top-right",
            textAlign: "left",
            textBaseline: "middle",
            fill: "#aaa",
            dx: 60,
          })
          .label({
            text: (d, i, data) =>
              i !== 0 ? r(data[i - 1][encodeY], data[i][encodeY]) : "",
            position: "top-right",
            textAlign: "left",
            textBaseline: "middle",
            dx: 60,
            dy: 15,
          })

        g2ChartInstance.current
          .connector()
          .data([
            {
              startX: data[0][encodeX],
              startY: data[data.length - 1][encodeX],
              endX: 0,
              endY: (data[0][encodeY] - data[data.length - 1][encodeY]) / 2,
            },
          ])
          .encode("x", "startX")
          .encode("x1", "startY")
          .encode("y", "endX")
          .encode("y1", "endY")
          .label({
            text: "转换率",
            position: "left",
            textAlign: "start",
            textBaseline: "middle",
            fill: "#aaa",
            dx: 10,
          })
          .label({
            text: r(data[0][encodeY], data[data.length - 1][encodeY]),
            position: "left",
            textAlign: "start",
            dy: 15,
            dx: 10,
            fill: "#000",
          })
          .style("stroke", "#aaa")
          .style("markerEnd", false)
          .style("connectLength1", -12)
          .style("offset2", -20)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/funnel/demo/funnel-annotation.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/funnel/demo/funnel-annotation.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/funnel/demo/funnel-annotation.ts:",
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
        <CardTitle>Annotation Funnel</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/funnel/demo/funnel-annotation.ts
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
