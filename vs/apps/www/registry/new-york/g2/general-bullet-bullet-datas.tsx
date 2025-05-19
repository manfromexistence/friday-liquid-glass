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

// Original G2 example path: integration/G2/site/examples/general/bullet/demo/bullet-datas.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_bullet_bullet_datas() {
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
        const colors = {
          ranges: ["#bfeec8", "#FFe0b0", "#FFbcb8"],
          measures: ["#61DDAA", "#5B8FF9"],
          target: "#39a3f4",
        }

        const data = [
          {
            title: "满意度",
            ranges: 100,
            measures: 60,
            target: 90,
          },
          {
            title: "满意度",
            ranges: 80,
            measures: 10,
          },
          {
            title: "满意度",
            ranges: 30,
          },
        ]

        g2ChartInstance.current.coordinate({
          transform: [{ type: "transpose" }],
        })

        g2ChartInstance.current
          .data(data)
          .scale("color", {
            range: [
              colors["ranges"],
              colors["measures"],
              colors["target"],
            ].flat(),
          })
          .legend("color", {
            itemMarker: (d) => {
              return d === "目标" ? "line" : "square"
            },
          })

        g2ChartInstance.current
          .interval()
          .axis({
            y: {
              grid: true,
              gridLineWidth: 2,
            },
            x: {
              title: false,
            },
          })
          .encode("x", "title")
          .encode("y", "ranges")
          .encode("color", (d, i) => ["优", "良", "差"][i])
          .style("maxWidth", 30)

        g2ChartInstance.current
          .interval()
          .encode("x", "title")
          .encode("y", "measures")
          .encode("color", (d, i) => ["下半年", "上半年"][i] || "下半年")
          .style("maxWidth", 20)
          .label({
            text: "measures",
            position: "right",
            textAlign: "left",
            dx: 5,
          })

        g2ChartInstance.current
          .point()
          .encode("x", "title")
          .encode("y", "target")
          .encode("shape", "line")
          .encode("color", () => "目标")
          .encode("size", 8)
          .style("lineWidth", 1)
          .tooltip({
            title: false,
            items: [{ channel: "y" }],
          })

        g2ChartInstance.current.interaction("tooltip", { shared: true })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/bullet/demo/bullet-datas.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/bullet/demo/bullet-datas.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/bullet/demo/bullet-datas.ts:",
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
        <CardTitle>Bullet more data</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/bullet/demo/bullet-datas.ts
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
