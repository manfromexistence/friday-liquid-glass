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

// Original G2 example path: integration/G2/site/examples/general/area/demo/label.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_area_label() {
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
  const States = [
    "Massachusetts",
    "Connecticut",
    "Maine",
    "Rhode Island",
    "New Hampshire",
    "Vermont",
    "New York",
    "Pennsylvania",
    "New Jersey",
    "North Carolina",
    "Virginia",
    "Georgia",
    "Florida",
    "Maryland",
    "South Carolina",
    "West Virginia",
    "District of Columbia",
    "Delaware",
    "Tennessee",
    "Kentucky",
    "Alabama",
    "Mississippi",
    "Texas",
    "Louisiana",
    "Oklahoma",
    "Arkansas",
    "Illinois",
    "Ohio",
    "Michigan",
    "Indiana",
    "Wisconsin",
    "Missouri",
    "Minnesota",
    "Iowa",
    "Kansas",
    "Nebraska",
    "South Dakota",
    "North Dakota",
    "Colorado",
    "Arizona",
    "Utah",
    "New Mexico",
    "Montana",
    "Idaho",
    "Nevada",
    "Wyoming",
    "California",
    "Washington",
    "Oregon",
    "Hawaii",
    "Alaska",
  ]

  const RegionStateMap = new Map([
    ["Alaska", "Pacific"],
    ["Alabama", "East South Central"],
    ["Arkansas", "West South Central"],
    ["Arizona", "Mountain"],
    ["California", "Pacific"],
    ["Colorado", "Mountain"],
    ["Connecticut", "New England"],
    ["District of Columbia", "South Atlantic"],
    ["Delaware", "South Atlantic"],
    ["Florida", "South Atlantic"],
    ["Georgia", "South Atlantic"],
    ["Hawaii", "Pacific"],
    ["Iowa", "West North Central"],
    ["Idaho", "Mountain"],
    ["Illinois", "East North Central"],
    ["Indiana", "East North Central"],
    ["Kansas", "West North Central"],
    ["Kentucky", "East South Central"],
    ["Louisiana", "West South Central"],
    ["Massachusetts", "New England"],
    ["Maryland", "South Atlantic"],
    ["Maine", "New England"],
    ["Michigan", "East North Central"],
    ["Minnesota", "West North Central"],
    ["Missouri", "West North Central"],
    ["Mississippi", "East South Central"],
    ["Montana", "Mountain"],
    ["North Carolina", "South Atlantic"],
    ["North Dakota", "West North Central"],
    ["Nebraska", "West North Central"],
    ["New Hampshire", "New England"],
    ["New Jersey", "Middle Atlantic"],
    ["New Mexico", "Mountain"],
    ["Nevada", "Mountain"],
    ["New York", "Middle Atlantic"],
    ["Ohio", "East North Central"],
    ["Oklahoma", "West South Central"],
    ["Oregon", "Pacific"],
    ["Pennsylvania", "Middle Atlantic"],
    ["Rhode Island", "New England"],
    ["South Carolina", "South Atlantic"],
    ["South Dakota", "West North Central"],
    ["Tennessee", "East South Central"],
    ["Texas", "West South Central"],
    ["Utah", "Mountain"],
    ["Virginia", "South Atlantic"],
    ["Vermont", "New England"],
    ["Washington", "Pacific"],
    ["Wisconsin", "East North Central"],
    ["West Virginia", "South Atlantic"],
    ["Wyoming", "Mountain"],
  ])

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
        g2ChartInstance.current.data({
          type: "fetch",
          value: "https://assets.antv.antgroup.com/g2/population-by-state.json",
          transform: [
            {
              type: "fold",
              fields: States,
              key: "state",
              value: "population",
            },
            {
              type: "map",
              callback: (d) => ({
                ...d,
                region: RegionStateMap.get(d.state),
                date: new Date(d.date),
              }),
            },
          ],
        })

        g2ChartInstance.current
          .area()
          .transform([{ type: "stackY" }, { type: "normalizeY" }])
          .encode("x", "date")
          .encode("y", "population")
          .encode("color", "region")
          .encode("series", "state")
          .label({
            text: "state",
            position: "area", // `area` type positon used here.
            selector: "first",
            transform: [{ type: "overlapHide" }],
            fontSize: 10,
          })
          .tooltip({ channel: "y", valueFormatter: (d) => d.toFixed(3) })

        g2ChartInstance.current
          .line()
          .transform([{ type: "stackY" }, { type: "normalizeY" }])
          .encode("x", "date")
          .encode("y", "population")
          .encode("series", "state")
          .encode("color", "region") // For LegendFilter.
          .style("stroke", "#000")
          .style("lineWidth", 0.5)
          .style("fillOpacity", 0.8)
          .tooltip(false)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/area/demo/label.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/area/demo/label.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/area/demo/label.ts:",
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
        <CardTitle>Area Label</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/area/demo/label.ts
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
