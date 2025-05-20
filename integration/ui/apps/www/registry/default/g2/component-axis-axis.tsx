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

// Original G2 example path: integration/G2/site/examples/component/axis/demo/axis.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_component_axis_axis() {
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
        g2ChartInstance.current.data([
          {
            pos: 1,
            no: 1,
            driver: "Max Verstappen",
            car: "RED BULL RACING HONDA RBPT",
            laps: 57,
            time: "1:33:56.736",
            pts: 25,
          },
          {
            pos: 2,
            no: 11,
            driver: "Sergio Perez",
            car: "RED BULL RACING HONDA RBPT",
            laps: 57,
            time: "+11.987s",
            pts: 18,
          },
          {
            pos: 3,
            no: 14,
            driver: "Fernando Alonso",
            car: "ASTON MARTIN ARAMCO MERCEDES",
            laps: 57,
            time: "+38.637s",
            pts: 15,
          },
          {
            pos: 4,
            no: 55,
            driver: "Carlos Sainz",
            car: "FERRARI",
            laps: 57,
            time: "+48.052s",
            pts: 12,
          },
          {
            pos: 5,
            no: 44,
            driver: "Lewis Hamilton",
            car: "MERCEDES",
            laps: 57,
            time: "+50.977s",
            pts: 10,
          },
        ])

        function medal(ranking) {
          if (ranking > 2) return `第${ranking + 1}名`
          const { document } = g2ChartInstance.current.getContext().canvas!
          const group = document.createElement("g", {})
          const size = ranking === 0 ? 20 : 15
          const icon = document.createElement("image", {
            style: {
              src: "https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*1NiMRKb2sfMAAAAAAAAAAAAADmJ7AQ/original",
              width: size,
              height: size,
              transform: `translate(-${size / 2}, -${size / 2})`,
            },
          })
          const text = ["冠军🏆", "亚军🥈", "季军🥉"][ranking]
          const label = document.createElement("text", {
            style: {
              text,
              fill: "gray",
              textAlign: "center",
              transform: `translate(0, 35)`,
            },
          })

          group.appendChild(icon)
          group.appendChild(label)
          return group
        }

        g2ChartInstance.current
          .interval()
          .encode("x", "pos")
          .encode("y", "pts")
          .encode("color", "pts")
          .axis({
            x: {
              title: "FORMULA 1 GULF AIR BAHRAIN GRAND PRIX 2023 - RACE RESULT",
              size: 80,
              labelFormatter: (datum, index) => medal(index),
            },
            y: false,
          })
          .label({
            text: "driver",
            transform: [{ type: "contrastReverse" }],
          })
          .label({
            text: "time",
            transform: [{ type: "contrastReverse" }],
            dy: 20,
            fontStyle: "italic",
          })
          .tooltip({ title: "car" })
          .legend(false)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/component/axis/demo/axis.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/component/axis/demo/axis.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/component/axis/demo/axis.ts:",
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
        <CardTitle>Axis</CardTitle>
        <CardDescription>
          G2 Chart. Original example: component/axis/demo/axis.ts
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
