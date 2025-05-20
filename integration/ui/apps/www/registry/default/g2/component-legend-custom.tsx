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

// Original G2 example path: integration/G2/site/examples/component/legend/demo/custom.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_component_legend_custom() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Trailing helpers extracted from original:

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
        const data = [
          { genre: "Sports", sold: 275 },
          { genre: "Strategy", sold: 115 },
          { genre: "Action", sold: 120 },
          { genre: "Shooter", sold: 350 },
          { genre: "Other", sold: 150 },
        ]

        const colorField = "genre"

        g2ChartInstance.current
          .interval()
          .data(data)
          .encode("x", "genre")
          .encode("y", "sold")
          .encode("color", colorField)
          .legend(false) // Hide built-in legends.

        g2ChartInstance.current.render().then(renderCustomLegend)

        function renderCustomLegend(g2ChartInstance) {
          // Get color scale.
          const scale = g2ChartInstance.getScaleByChannel("color")
          const { domain, range } = scale.getOptions()
          const excludedValues = []

          // Create items from scale domain.
          const items = domain.map((text, i) => {
            const span = document.createElement("span")
            const color = range[i]

            // Items' style.
            span.innerText = text
            span.style.display = "inline-block"
            span.style.padding = "0.5em"
            span.style.color = color
            span.style.cursor = "pointer"

            span.onclick = () => {
              const index = excludedValues.findIndex((d) => d === text)
              if (index === -1) {
                excludedValues.push(text)
                span.style.color = "#aaa"
              } else {
                excludedValues.splice(index, 1)
                span.style.color = color
              }
              onChange(excludedValues)
            }

            return span
          })

          // Mount legend items.
          const container = document.getElementById("container")
          const canvas = container.getElementsByTagName("canvas")[0]
          const legend = document.createElement("legend")
          container.insertBefore(legend, canvas)
          for (const item of items) legend.append(item)

          // Emit legendFilter event.
          function onChange(values) {
            const selectedValues = domain.filter((d) => !values.includes(d))
            const selectedData = data.filter((d) =>
              selectedValues.includes(d[colorField])
            )
            g2ChartInstance.changeData(selectedData)
          }
        }
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/component/legend/demo/custom.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/component/legend/demo/custom.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/component/legend/demo/custom.ts:",
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
        <CardTitle>Custom Legend</CardTitle>
        <CardDescription>
          G2 Chart. Original example: component/legend/demo/custom.ts
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
