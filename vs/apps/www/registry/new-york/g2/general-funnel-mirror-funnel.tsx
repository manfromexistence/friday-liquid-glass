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

// Original G2 example path: integration/G2/site/examples/general/funnel/demo/mirror-funnel.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_funnel_mirror_funnel() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const data = [
    { action: "访问", visitor: 500, site: "站点1" },
    { action: "浏览", visitor: 400, site: "站点1" },
    { action: "交互", visitor: 300, site: "站点1" },
    { action: "下单", visitor: 200, site: "站点1" },
    { action: "完成", visitor: 100, site: "站点1" },
    { action: "访问", visitor: 550, site: "站点2" },
    { action: "浏览", visitor: 420, site: "站点2" },
    { action: "交互", visitor: 280, site: "站点2" },
    { action: "下单", visitor: 150, site: "站点2" },
    { action: "完成", visitor: 80, site: "站点2" },
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
        g2ChartInstance.current.data(data)

        g2ChartInstance.current.scale("x", { padding: 0 })
        g2ChartInstance.current.scale("color", {
          range: ["#0050B3", "#1890FF", "#40A9FF", "#69C0FF", "#BAE7FF"],
        })
        g2ChartInstance.current.axis(false)

        g2ChartInstance.current.coordinate({
          transform: [{ type: "transpose" }],
        })

        g2ChartInstance.current
          .interval()
          .data({
            transform: [
              {
                type: "filter",
                callback: (d) => d.site === "站点1",
              },
            ],
          })
          .encode("x", "action")
          .encode("y", "visitor")
          .encode("color", "action")
          .encode("shape", "funnel")
          .label({
            text: "visitor",
            position: "inside",
            transform: [{ type: "contrastReverse" }],
          })
          .label({
            text: "action",
            position: "right",
            dx: (d) => {
              return d.action === "完成" ? 48 : 16
            },
          })
          .style("stroke", "#FFF")
          .animate("enter", { type: "fadeIn" })

        g2ChartInstance.current
          .interval()
          .data({
            transform: [
              {
                type: "filter",
                callback: (d) => d.site === "站点2",
              },
            ],
          })
          .encode("x", "action")
          .encode("y", (d) => -d.visitor)
          .encode("color", "action")
          .encode("shape", "funnel")
          .label({
            text: "visitor",
            position: "inside",
            transform: [{ type: "contrastReverse" }],
          })
          .style("stroke", "#FFF")
          .animate("enter", { type: "fadeIn" })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/funnel/demo/mirror-funnel.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/funnel/demo/mirror-funnel.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/funnel/demo/mirror-funnel.ts:",
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
        <CardTitle>Mirror Funnel</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/funnel/demo/mirror-funnel.ts
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
