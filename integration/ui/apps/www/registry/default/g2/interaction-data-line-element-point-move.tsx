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

// Original G2 example path: integration/G2/site/examples/interaction/data/demo/line-element-point-move.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_interaction_data_line_element_point_move() {
  const chartRef = useRef<HTMLDivElement>(null)
  const g2ChartInstance = useRef<Chart | null>(null)
  const shadcnColors = useShadcnChartColors(chartRef)

  useEffect(() => {
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
      try {
        g2ChartInstance.current = new Chart({
          container: chartRef.current,
          autoFit: true,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current
          .line()
          .data([
            { year: "1991", value: 3, type: "type1" },
            { year: "1992", value: 4, type: "type1" },
            { year: "1993", value: 3.5, type: "type1" },
            { year: "1994", value: 5, type: "type1" },
            { year: "1995", value: 4.9, type: "type1" },
            { year: "1996", value: 2, type: "type1" },
            { year: "1997", value: 7, type: "type1" },
            { year: "1998", value: 11, type: "type1" },
            { year: "1999", value: 13, type: "type1" },
            { year: "1991", value: 6, type: "type2" },
            { year: "1992", value: 1, type: "type2" },
            { year: "1993", value: 4, type: "type2" },
            { year: "1994", value: 9, type: "type2" },
            { year: "1995", value: 1.9, type: "type2" },
            { year: "1996", value: 5, type: "type2" },
            { year: "1997", value: 4, type: "type2" },
            { year: "1998", value: 6, type: "type2" },
            { year: "1999", value: 15, type: "type2" },
          ])
          .interaction({
            legendFilter: false,
            elementPointMove: {
              pointR: 8,
              pointStrokeWidth: 2,
              pointActiveStroke: "#fff",
              pathLineDash: [2, 4],
              pathStroke: "red",
              labelFontSize: 14,
              labelY: 24,
            },
          })
          .encode("x", "year")
          .encode("y", "value")
          .encode("key", "type")
          .encode("color", "type")
        g2ChartInstance.current.render().then(() => {
          g2ChartInstance.current.on("element-point:select", (v) => {
            const {
              data: { selection },
            } = v
            console.log(selection, "selection")
          })
          g2ChartInstance.current.on("element-point:moved", (v) => {
            const {
              data: { changeData, data },
            } = v
            console.log(changeData, "changeData")
            console.log(data, "data")
          })
        })
        g2ChartInstance.current.on("afterrender", () => {
          g2ChartInstance.current.emit("element-point:select", {
            data: { selection: [1, 2] },
          })
        })
      } catch (error) {
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart.</div>'
        }
      }
    }
    return () => {
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
        <CardTitle>Line Numerical Interaction</CardTitle>
        <CardDescription>
          G2 Chart. Original example:
          interaction/data/demo/line-element-point-move.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
