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

// Original G2 example path: integration/G2/site/examples/general/interval/demo/bar-stacked-diverging-rounded.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_interval_bar_stacked_diverging_rounded() {
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
  /**
   * A recreation of this demo: https://nivo.rocks/storybook/?path=/docs/bar--diverging-stacked
   */

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
          paddingLeft: 25,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current
          .interval()
          .data({
            type: "fetch",
            value: "https://assets.antv.antgroup.com/g2/nivo-gain-lost.json",
            transform: [
              {
                type: "fold",
                fields: [
                  "lost > 100$",
                  "lost <= 100$",
                  "gained <= 100$",
                  "gained > 100$",
                ],
              },
            ],
          })
          .transform([{ type: "stackY" }])
          .encode("x", "user")
          .encode("y", "value")
          .encode("color", "key")
          .scale("x", { padding: 0.2 })
          .scale("y", { domainMin: -100, domainMax: 100 })
          .scale("color", {
            domain: [
              "lost > 100$",
              "lost <= 100$",
              "gained <= 100$",
              "gained > 100$",
            ],
            range: ["#97e3d5", "#61cdbb", "#e25c3b", "#f47560"],
          })
          .legend("color", { title: false })
          .label({
            text: "value",
            position: "inside",
            formatter: (v) => (v ? `${v}%` : ""),
            transform: [{ type: "overlapDodgeY" }],
            fill: "#000",
            fontSize: 10,
          })
          .axis("y", {
            position: "right",
            title: false,
            labelFormatter: (v) => `${v}%`,
          })
          .style("radius", 10)

        g2ChartInstance.current
          .lineY()
          .data([0])
          .style("lineWidth", 2)
          .style("stroke", "#e25c3b")
          .style("strokeOpacity", 1)

        g2ChartInstance.current.call(titleLeft, "75%", "lost", "#61cdbb")
        g2ChartInstance.current.call(titleLeft, "20%", "gain", "#e25c3b")

        function titleLeft(node, y, text, fill) {
          node
            .text()
            .style("x", -10)
            .style("y", y)
            .style("text", text)
            .style("fontWeight", "bold")
            .style("dy", -10)
            .style("transform", "rotate(-90)")
            .style("fill", fill)
        }

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/interval/demo/bar-stacked-diverging-rounded.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/interval/demo/bar-stacked-diverging-rounded.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/interval/demo/bar-stacked-diverging-rounded.ts:",
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
        <CardTitle>Rounded Diverging Stacked Bar Chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example:
          general/interval/demo/bar-stacked-diverging-rounded.ts
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
