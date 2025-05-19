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

// Original G2 example path: integration/G2/site/examples/interesting/interesting/demo/timeline.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_interesting_interesting_timeline() {
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
          paddingLeft: 60,
          paddingRight: 60,
          width: 1000,
          height: 300,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        const data = [
          {
            year: 1788,
            composition: 'Symphony No. 41 "Jupiter"',
            composer: "Wolfgang Amadeus Mozart",
            link: "https://en.wikipedia.org/wiki/Symphony_No._41_(Mozart)",
          },
          {
            year: 1894,
            composition: "Prelude to the Afternoon of a Faun",
            composer: "Claude Debussy",
            link: "https://en.wikipedia.org/wiki/Pr%C3%A9lude_%C3%A0_l%27apr%C3%A8s-midi_d%27un_faune",
          },
          {
            year: 1805,
            composition: 'Symphony No. 3 "Eroica"',
            composer: "Ludwig van Beethoven",
            link: "https://en.wikipedia.org/wiki/Symphony_No._3_(Beethoven)",
          },
          {
            year: 1913,
            composition: "Rite of Spring",
            composer: "Igor Stravinsky",
            link: "https://en.wikipedia.org/wiki/The_Rite_of_Spring",
          },
          {
            year: 1741,
            composition: "Goldberg Variations",
            composer: "Johann Sebastian Bach",
            link: "https://en.wikipedia.org/wiki/Goldberg_Variations",
          },
          {
            year: 1881,
            composition: "Piano Concerto No. 2",
            composer: "Johannes Brahms",
            link: "https://en.wikipedia.org/wiki/Piano_Concerto_No._2_(Brahms)",
          },
          {
            year: 1826,
            composition: 'A Midsummer Night\'s Dream "Overture"',
            composer: "Felix Mendelssohn",
            link: "https://en.wikipedia.org/wiki/A_Midsummer_Night%27s_Dream_(Mendelssohn)",
          },
        ]

        g2ChartInstance.current.data(data)

        g2ChartInstance.current
          .line()
          .encode("x", "year")
          .encode("y", 1)
          .style("lineWidth", 1)
          .style("stroke", "#000")
          .attr("zIndex", 1)
          .label({
            text: "year",
            dy: (d) => (d.year % 2 === 1 ? 8 : -4),
            textAlign: "center",
            textBaseline: (d) => (d.year % 2 === 1 ? "top" : "bottom"),
          })
          .label({
            text: (d) =>
              d.composition +
              ` (${d.composer.slice(d.composer.lastIndexOf(" "))})`,
            dy: (d) => (d.year % 2 === 0 ? 28 : -28),
            textAlign: "center",
            textBaseline: (d) => (d.year % 2 === 0 ? "top" : "bottom"),
            wordWrap: true,
            wordWrapWidth: 120,
            connector: true,
          })
          .axis(false)

        g2ChartInstance.current
          .point()
          .encode("x", "year")
          .encode("y", 1)
          .attr("zIndex", 1)
          .style("lineWidth", 1.5)
          .style("stroke", "#000")
          .style("fill", "#fff")

        g2ChartInstance.current.interaction("tooltip", false)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/interesting/interesting/demo/timeline.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/interesting/interesting/demo/timeline.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/interesting/interesting/demo/timeline.ts:",
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
        <CardTitle>Timeline</CardTitle>
        <CardDescription>
          G2 Chart. Original example: interesting/interesting/demo/timeline.ts
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
