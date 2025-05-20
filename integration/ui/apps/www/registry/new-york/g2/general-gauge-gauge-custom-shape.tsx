// @ts-nocheck
"use client"

import React, { useEffect, useRef } from "react"
import { Path } from "@antv/g"
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

// Original G2 example path: integration/G2/site/examples/general/gauge/demo/gauge-custom-shape.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_gauge_gauge_custom_shape() {
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
        g2ChartInstance.current = new Chart({ container: chartRef.current })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        function getOrigin(points) {
          if (points.length === 1) return points[0]
          const [[x0, y0, z0 = 0], [x2, y2, z2 = 0]] = points
          return [(x0 + x2) / 2, (y0 + y2) / 2, (z0 + z2) / 2]
        }
        // 自定义指针形状
        const customShape = (style) => {
          return (points, value, coordinate, theme) => {
            // 获取几何点中心坐标
            const [x, y] = getOrigin(points)
            const [cx, cy] = coordinate.getCenter()
            // 计算指针方向角度
            const angle = Math.atan2(y - cy, x - cx)
            const length = 100 // 指针长度
            const width = 8 // 指针底部宽度
            // 构造指针三角形路径
            return new Path({
              style: {
                d: [
                  [
                    "M",
                    cx + Math.cos(angle) * length,
                    cy + Math.sin(angle) * length,
                  ], // 顶点
                  [
                    "L",
                    cx + Math.cos(angle + Math.PI / 2) * width,
                    cy + Math.sin(angle + Math.PI / 2) * width,
                  ], // 底部左点
                  [
                    "L",
                    cx + Math.cos(angle - Math.PI / 2) * width,
                    cy + Math.sin(angle - Math.PI / 2) * width,
                  ], // 底部右点
                  ["Z"], // 闭合路径
                ],
                fill: "#30BF78", // 填充色
              },
            })
          }
        }

        g2ChartInstance.current.options({
          type: "gauge",
          data: {
            value: {
              target: 159,
              total: 424,
              name: "score",
            },
          },
          style: {
            pointerShape: customShape,
            pinShape: false,
            textContent: (target, total) => {
              return `得分：${target}\n占比：${(target / total) * 100}%`
            },
          },
        })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/gauge/demo/gauge-custom-shape.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/gauge/demo/gauge-custom-shape.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/gauge/demo/gauge-custom-shape.ts:",
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
        <CardTitle>Custom Shape Gauge Chart</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/gauge/demo/gauge-custom-shape.ts
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
