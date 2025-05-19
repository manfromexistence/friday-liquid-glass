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

// Original G2 example path: integration/G2/site/examples/storytelling/storytelling/demo/point-keyframe.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_storytelling_storytelling_point_keyframe() {
  const chartRef = useRef<HTMLDivElement>(null)
  const g2ChartInstance = useRef<Chart | null>(null)
  const shadcnColors = useShadcnChartColors(chartRef)

  useEffect(() => {
    let isMounted = true
    if (shadcnColors && shadcnColors.length === 5) {
      try {
        register("palette.shadcnPalette", () => shadcnColors)
      } catch (e) {
        register("palette.shadcnPalette", () =>
          JSON.parse(FALLBACK_COLORS_JSON)
        )
      }
    } else {
      register("palette.shadcnPalette", () => JSON.parse(FALLBACK_COLORS_JSON))
    }
    if (chartRef.current && !g2ChartInstance.current) {
      fetch(
        "https://gw.alipayobjects.com/os/bmw-prod/fbe4a8c1-ce04-4ba3-912a-0b26d6965333.json"
      )
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return
          try {
            g2ChartInstance.current = new Chart({
              container: chartRef.current,
            })
            g2ChartInstance.current.theme({
              defaultCategory10: "shadcnPalette",
              defaultCategory20: "shadcnPalette",
            })
            const keyframe = g2ChartInstance.current
              .timingKeyframe()
              .attr("direction", "alternate")
              .attr("iterationCount", 4)
            keyframe
              .interval()
              .data(data)
              .transform({ type: "groupX", y: "mean" })
              .encode("x", "gender")
              .encode("y", "weight")
              .encode("color", "gender")
              .encode("key", "gender")
            keyframe
              .point()
              .data(data)
              .encode("x", "height")
              .encode("y", "weight")
              .encode("color", "gender")
              .encode("groupKey", "gender")
              .encode("shape", "point")
            g2ChartInstance.current.render()
          } catch (error) {
            if (chartRef.current) {
              chartRef.current.innerHTML =
                '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/storytelling/storytelling/demo/point-keyframe.ts</div>'
            }
          }
        })
    }
    return () => {
      isMounted = false
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch {}
        g2ChartInstance.current = null
      }
    }
  }, [shadcnColors])
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Point Keyframe</CardTitle>
        <CardDescription>
          G2 Chart. Original example:
          storytelling/storytelling/demo/point-keyframe.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
