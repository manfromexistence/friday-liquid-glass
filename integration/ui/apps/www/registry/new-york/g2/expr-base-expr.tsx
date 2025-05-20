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

// Original G2 example path: integration/G2/site/examples/expr/base/demo/expr.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_expr_base_expr() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.

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
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        const spec = {
          type: "spaceLayer",
          height: 840,
          width: 640,
          data: {
            type: "fetch",
            value:
              "https://gw.alipayobjects.com/os/bmw-prod/79fd9317-d2af-4bc4-90fa-9d07357398fd.csv",
            format: "csv",
          },
          children: [
            {
              type: "interval",
              height: 360,
              width: 360,
              legend: false,
              x: 280,
              transform: [{ type: "stackY" }],
              coordinate: { type: "theta" },
              scale: {
                color: { palette: "spectral" },
              },
              encode: {
                y: "value",
                color: "name",
                enterDelay:
                  "{a.value>10000000 ? a.value>20000000 ? 2000 : 1000 : 0}",
              },
              style: {
                stroke: '{ a.value>20000000 ? "purple" : null}',
              },
              labels: [
                {
                  text: '{"*" + a.name}',
                  radius:
                    "{a.value>15000000 ? a.value>20000000 ? 0.6 : 0.75 : 0.9}",
                  style: {
                    fontSize:
                      "{a.value>15000000 ? a.value>20000000 ? 12 : 10 : 6}",
                    fontWeight: "bold",
                  },
                  transform: [{ type: "contrastReverse" }],
                },
                {
                  text: '{b < c.length - 3 ? a.value : ""}',
                  radius:
                    "{a.value>15000000 ? a.value>20000000 ? 0.6 : 0.75 : 0.9}",
                  style: { fontSize: 9, dy: 12 },
                  transform: [{ type: "contrastReverse" }],
                },
              ],
              animate: { enter: { type: "waveIn", duration: 600 } },
            },
            {
              type: "view",
              height: 400,
              width: 540,
              y: 300,
              children: [
                {
                  type: "interval",
                  height: 400,
                  width: 540,
                  legend: false,
                  y: 300,
                  scale: {
                    color: { palette: "spectral" },
                  },
                  encode: {
                    y: "value",
                    x: "name",
                    color: "name",
                    enterDelay:
                      "{a.value>10000000 ? a.value>20000000 ? 2000 : 1000 : 0}",
                  },
                },
                {
                  type: "line",
                  height: 400,
                  width: 540,
                  legend: false,
                  y: 300,
                  encode: { x: "name", y: "value" },
                  scale: { y: { independent: true } },
                  labels: [
                    {
                      text: "{a.value}",
                      selector: "{a}",
                    },
                  ],
                  axis: {
                    y: {
                      position: "right",
                      grid: null,
                    },
                  },
                },
              ],
            },
          ],
        }

        g2ChartInstance.current.options(spec)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/expr/base/demo/expr.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/expr/base/demo/expr.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/expr/base/demo/expr.ts:",
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
        <CardTitle>Spec Function Expression</CardTitle>
        <CardDescription>
          G2 Chart. Original example: expr/base/demo/expr.ts
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
