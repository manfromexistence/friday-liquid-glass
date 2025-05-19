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

// Original G2 example path: integration/G2/site/examples/interesting/interesting/demo/petal.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_interesting_interesting_petal() {
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
  // 注册自定义图形，代码在下面
  register("shape.interval.petal", petal)

  // Trailing helpers extracted from original:

  /** Functions for custom shape. */

  function getPoint(p0, p1, ratio) {
    return [p0[0] + (p1[0] - p0[0]) * ratio, p0[1] + (p1[1] - p0[1]) * ratio]
  }

  function sub(p1, p2) {
    const [x1, y1] = p1
    const [x2, y2] = p2
    return [x1 - x2, y1 - y2]
  }

  function dist(p0, p1) {
    const [x0, y0] = p0
    const [x1, y1] = p1
    return Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2)
  }

  function getAngle(p) {
    const [x, y] = p
    return Math.atan2(y, x)
  }

  function getXY(angle, center, radius) {
    return [
      Math.cos(angle) * radius + center[0],
      Math.sin(angle) * radius + center[1],
    ]
  }

  /**
   * Custom shape for petal.
   */
  function petal({ offset = 1, ratio = 0.5 }, context) {
    const { coordinate } = context
    return (points, value, defaults) => {
      // 圆形坐标
      const center = coordinate.getCenter()
      // 1° 的偏移
      const offsetAngle = (Math.PI / 180) * offset
      // eslint-disable-next-line
      let [p0, p1, p2, p3] = points
      // 半径
      const radius = dist(center, p0)
      const qRadius = radius * ratio
      const angleQ1 = getAngle(sub(p3, center)) + offsetAngle
      const angleQ2 = getAngle(sub(p0, center)) - offsetAngle

      // 偏移 1° 后的 q1, q2
      const q1 = getXY(angleQ1, center, qRadius)
      const q2 = getXY(angleQ2, center, qRadius)

      // 偏移 1° 后的 p3, p0
      p3 = getXY(angleQ1, center, radius)
      p0 = getXY(angleQ2, center, radius)

      // mid 对应的角度为 p0 和 p3 中点的夹角
      const angle = getAngle(sub(getPoint(p0, p3, 0.5), center))
      const mid = getXY(angle, center, radius)

      const path = [
        ["M", ...p1],
        ["L", ...q1],
        ["Q", ...p3, ...mid],
        ["Q", ...p0, ...q2],
        ["L", ...p2],
        ["Z"],
      ]

      const { document } = g2ChartInstance.current.getContext().canvas
      const g = document.createElement("g", {})
      const p = document.createElement("path", {
        style: {
          d: path,
          inset: 1,
          fill: value.color,
        },
      })
      g.appendChild(p)

      return g
    }
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
        g2ChartInstance.current.coordinate({ type: "theta" })

        g2ChartInstance.current.data([
          { type: "分类一", value: 27 },
          { type: "分类二", value: 25 },
          { type: "分类三", value: 18 },
          { type: "分类四", value: 15 },
          { type: "分类五", value: 10 },
          { type: "Other", value: 5 },
        ])

        g2ChartInstance.current
          .interval()
          .transform({ type: "stackY" })
          .encode("y", "value")
          .encode("color", "type")
          .encode("shape", "petal")
          .style("offset", 0.5) // 👈🏻 在这里配置属性
          .style("ratio", 0.2) // 👈🏻 在这里配置属性
          .label({
            text: (d, i, data) => d.type + "\n" + d.value,
            radius: 0.9,
            fontSize: 9,
            dy: 12,
          })
          .animate("enter", { type: "fadeIn" })
          .legend(false)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/interesting/interesting/demo/petal.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/interesting/interesting/demo/petal.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/interesting/interesting/demo/petal.ts:",
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
        <CardTitle>Petal Chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example: interesting/interesting/demo/petal.ts
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
