// @ts-nocheck
"use client"

import React, { useEffect, useRef } from "react"
import { Chart, MASK_CLASS_NAME, register } from "@antv/g2"

import { useShadcnChartColors } from "@/hooks/use-shadcn-chart-colors"
// Import the hook
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"

// Original G2 example path: integration/G2/site/examples/interaction/brush/demo/brush.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_interaction_brush_brush() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Trailing helpers extracted from original:

  function useTip({
    container,
    onRemove = () => {},
    offsetX = 20,
    offsetY = 0,
  }) {
    let div

    const render = (data, [x, y]) => {
      if (div) remove()
      div = document.createElement("div")
      div.innerHTML = `
      Select a node:
      <ul>${data
        .map((d) => `<li>x:${d.weight},y:${d.height}</li>`)
        .join("")}</ul>
      `
      div.style.position = "absolute"
      div.style.background = "#eee"
      div.style.padding = "0.5em"
      div.style.left = x + offsetX + "px"
      div.style.top = y + offsetY + "px"
      div.onclick = () => {
        remove()
        onRemove()
      }
      container.append(div)
    }

    const remove = () => {
      if (div) div.remove()
      div = null
    }

    return [render, remove]
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
        const [render, remove] = useTip({
          container: document.getElementById("container"),
          onRemove: () => g2ChartInstance.current.emit("brush:remove", {}),
        })

        g2ChartInstance.current
          .point()
          .data({
            type: "fetch",
            value:
              "https://gw.alipayobjects.com/os/antvdemo/assets/data/scatter.json",
          })
          .encode("x", "weight")
          .encode("y", "height")
          .encode("color", "gender")
          .encode("shape", "point")
          .style({
            fillOpacity: 0.2,
            lineWidth: 1,
            transform: "scale(1, 1)",
            transformOrigin: "center center",
          })
          .state("inactive", {
            fill: "black",
            fillOpacity: 0.5,
            transform: "scale(0.5, 0.5)",
          })
          .interaction("brushHighlight", true)

        g2ChartInstance.current.on("brush:start", onStart)
        g2ChartInstance.current.on("brush:end", onUpdate)
        g2ChartInstance.current.on("brush:remove", onRemove)

        g2ChartInstance.current.render()

        function onStart() {
          g2ChartInstance.current.emit("tooltip:disable")
          remove()
        }

        async function onUpdate(e) {
          const data = await fetch(
            "https://gw.alipayobjects.com/os/antvdemo/assets/data/scatter.json"
          ).then((res) => res.json())

          const { canvas } = g2ChartInstance.current.getContext()
          const [mask] = canvas.document.getElementsByClassName(MASK_CLASS_NAME)
          const bounds = mask.getBounds()
          const x = bounds.max[0]
          const y = bounds.center[1]
          const [X, Y] = e.data.selection

          const filtered = data.filter(({ weight, height }) => {
            return (
              weight >= X[0] &&
              weight <= X[1] &&
              height >= Y[0] &&
              height <= Y[1]
            )
          })

          render(filtered, [x, y])
        }

        function onRemove(e) {
          const { nativeEvent } = e
          if (nativeEvent) remove()
          g2ChartInstance.current.emit("tooltip:enable")
        }
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/interaction/brush/demo/brush.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/interaction/brush/demo/brush.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/interaction/brush/demo/brush.ts:",
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
        <CardTitle>Brush</CardTitle>
        <CardDescription>
          G2 Chart. Original example: interaction/brush/demo/brush.ts
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
