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

// Original G2 example path: integration/G2/site/examples/interaction/multi-view/demo/focus-context.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_interaction_multi_view_focus_context() {
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

  // Remove invalid DOM manipulation and fix context chart rendering
  // Remove:
  // document.getElementById('container').innerHTML = ...
  // Instead, render both charts in React-managed divs.

  // Add a ref for the context chart
  const contextRef = useRef<HTMLDivElement>(null)

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

    if (chartRef.current && contextRef.current && !g2ChartInstance.current) {
      try {
        // --- G2 Chart Logic Start ---
        g2ChartInstance.current = new Chart({
          container: chartRef.current,
          height: 360,
          paddingLeft: 60,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current
          .area()
          .data({
            type: "fetch",
            value:
              "https://gw.alipayobjects.com/os/bmw-prod/551d80c6-a6be-4f3c-a82a-abd739e12977.csv",
          })
          .encode("x", "date")
          .encode("y", "close")
          .animate(false)
          .axis("x", { grid: false, title: false, tickCount: 5 })
          .axis("y", { grid: false, tickCount: 5 })
          .interaction("tooltip", false)
          .interaction("brushXFilter", true)
        g2ChartInstance.current.render()

        // Render context View in contextRef
        const context = new Chart({
          container: contextRef.current,
          paddingTop: 0,
          paddingBottom: 0,
          height: 90,
          paddingLeft: 60,
        })
        context
          .area()
          .data({
            type: "fetch",
            value:
              "https://gw.alipayobjects.com/os/bmw-prod/551d80c6-a6be-4f3c-a82a-abd739e12977.csv",
          })
          .encode("x", "date")
          .encode("y", "close")
          .animate(false)
          .axis(false)
          .interaction("tooltip", false)
          .interaction("brushXHighlight", {
            series: true,
            maskOpacity: 0.3,
            maskFill: "#777",
            maskHandleWRender: createPathRender((x, y, width, height) => ({
              d: "M-0.5,31.5c-2.5,0,-4.5,2,-4.5,4.5v30c0,2.5,2,4.5,4.5,4.5V31.5z",
              transform: `translate(${x + width / 2}, ${y - height / 2})`,
            })),
            maskHandleERender: createPathRender((x, y, width, height) => ({
              d: "M0.5,31.5c2.5,0,4.5,2,4.5,4.5v30c0,2.5,-2,4.5,-4.5,4.5V31.5z",
              transform: `translate(${x + width / 2}, ${y - height / 2})`,
            })),
            maskHandleEFill: "#D3D8E0",
            maskHandleWFill: "#D3D8E0",
          })
        context.render()

        function createPathRender(compute) {
          return (group, options, document) => {
            if (!group.handle) {
              const path = document.createElement("path")
              group.handle = path
              group.appendChild(group.handle)
            }
            const { handle } = group
            const { x, y, width, height, ...rest } = options
            if (width === undefined || height === undefined) return handle
            handle.attr({ ...compute(x, y, width, height), ...rest })
            return handle
          }
        }

        // Add event listeners to communicate.
        g2ChartInstance.current.on("brush:filter", (e) => {
          const { nativeEvent } = e
          if (!nativeEvent) return
          const { selection } = e.data
          const { x: scaleX } = g2ChartInstance.current.getScale()
          const [[x1, x2]] = selection
          const domainX = scaleX.getOptions().domain
          if (x1 === domainX[0] && x2 === domainX[1]) {
            context.emit("brush:remove", {})
          } else {
            context.emit("brush:highlight", { data: { selection } })
          }
        })

        context.on("brush:highlight", (e) => {
          const { nativeEvent, data } = e
          if (!nativeEvent) return
          const { selection } = data
          g2ChartInstance.current.emit("brush:filter", { data: { selection } })
        })

        context.on("brush:remove", (e) => {
          const { nativeEvent } = e
          if (!nativeEvent) return
          const { x: scaleX, y: scaleY } = context.getScale()
          const selection = [
            scaleX.getOptions().domain,
            scaleY.getOptions().domain,
          ]
          g2ChartInstance.current.emit("brush:filter", { data: { selection } })
        })
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/interaction/multi-view/demo/focus-context.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/interaction/multi-view/demo/focus-context.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/interaction/multi-view/demo/focus-context.ts:",
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
        <CardTitle>Focus and Context</CardTitle>
        <CardDescription>
          G2 Chart. Original example:
          interaction/multi-view/demo/focus-context.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
        <div
          ref={contextRef}
          style={{ width: "100%", minHeight: "100px", marginTop: 8 }}
        />
      </CardContent>
    </Card>
  )
}
