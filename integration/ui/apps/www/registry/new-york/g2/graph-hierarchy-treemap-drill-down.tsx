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

// Original G2 example path: integration/G2/site/examples/graph/hierarchy/demo/treemap-drill-down.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_graph_hierarchy_treemap_drill_down() {
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
          width: 600,
          height: 400,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        const data = {
          name: "商品",
          children: [
            {
              name: "文具",
              children: [
                {
                  name: "笔",
                  children: [
                    { name: "铅笔", value: 430 },
                    { name: "圆珠笔", value: 530 },
                    { name: "钢笔", value: 80 },
                    { name: "水彩", value: 130 },
                  ],
                },
                { name: "铅笔盒", value: 30 },
                { name: "直尺", value: 60 },
                { name: "笔记本", value: 160 },
                { name: "其他", value: 80 },
              ],
            },
            {
              name: "零食",
              children: [
                { name: "饼干", value: 280 },
                { name: "辣条", value: 150 },
                { name: "牛奶糖", value: 210 },
                { name: "泡泡糖", value: 80 },
                {
                  name: "饮品",
                  children: [
                    { name: "可乐", value: 122 },
                    { name: "矿泉水", value: 244 },
                    { name: "果汁", value: 49 },
                    { name: "牛奶", value: 82 },
                  ],
                },
                { name: "其他", value: 40 },
              ],
            },
            { name: "其他", value: 450 },
          ],
        }

        g2ChartInstance.current
          .treemap()
          .data({
            value: data,
          })
          .layout({
            tile: "treemapBinary",
            paddingInner: 5,
          })
          .encode("value", "value")
          .interaction({
            treemapDrillDown: {
              breadCrumbY: 12,
              activeFill: "#873bf4",
            },
          })
          .style({
            labelFill: "#000",
            labelStroke: "#fff",
            labelLineWidth: 1.5,
            labelFontSize: 14,
            labelPosition: "top-left",
            labelDx: 5,
            labelDy: 5,
          })

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/graph/hierarchy/demo/treemap-drill-down.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/graph/hierarchy/demo/treemap-drill-down.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/graph/hierarchy/demo/treemap-drill-down.ts:",
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
        <CardTitle>Treemap DrillDown</CardTitle>
        <CardDescription>
          G2 Chart. Original example: graph/hierarchy/demo/treemap-drill-down.ts
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
