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

// Original G2 example path: integration/G2/site/examples/storytelling/storytelling/demo/facet-keyframe.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_storytelling_storytelling_facet_keyframe() {
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
        "https://gw.alipayobjects.com/os/bmw-prod/7fbb7084-cf34-4e7c-91b3-09e4748dc5e9.json"
      )
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return
          try {
            g2ChartInstance.current = new Chart({
              container: chartRef.current,
              width: 800,
            })
            g2ChartInstance.current.theme({
              defaultCategory10: "shadcnPalette",
              defaultCategory20: "shadcnPalette",
            })
            const padding = (node) =>
              node.attr("paddingRight", 120).attr("paddingLeft", 70)
            const encode = (node) =>
              node
                .encode("shape", "smooth")
                .encode("x", (d) => new Date(d.date))
                .encode("y", "unemployed")
                .encode("color", "industry")
                .encode("key", "industry")
            const utcX = (node) => node.scale("x", { utc: true })
            const keyframe = g2ChartInstance.current
              .timingKeyframe()
              .attr("direction", "alternate")
              .attr("iterationCount", 2)
            keyframe
              .facetRect()
              .call(padding)
              .attr("paddingBottom", 60)
              .data(data)
              .encode("y", "industry")
              .area()
              .attr("class", "area")
              .attr("frame", false)
              .call(encode)
              .call(utcX)
              .scale("y", { facet: false })
              .style("fillOpacity", 1)
              .animate("enter", { type: "scaleInY" })
            keyframe
              .area()
              .call(padding)
              .data(data)
              .attr("class", "area")
              .transform({ type: "stackY", reverse: true })
              .call(encode)
              .call(utcX)
              .style("fillOpacity", 1)
            keyframe
              .area()
              .call(padding)
              .data(data)
              .attr("class", "area")
              .call(encode)
              .call(utcX)
              .style("fillOpacity", 0.8)
            g2ChartInstance.current.render()
          } catch (error) {
            if (chartRef.current) {
              chartRef.current.innerHTML =
                '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/storytelling/storytelling/demo/facet-keyframe.ts</div>'
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
        <CardTitle>Facet Keyframe</CardTitle>
        <CardDescription>
          G2 Chart. Original example:
          storytelling/storytelling/demo/facet-keyframe.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
