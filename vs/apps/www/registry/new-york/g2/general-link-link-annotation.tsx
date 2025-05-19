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

// Original G2 example path: integration/G2/site/examples/general/link/demo/link-annotation.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_link_link_annotation() {
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
  /**
   * A recreation of this demo: https://observablehq.com/@observablehq/plot-link?collection=@observablehq/plot
   */

  const income = [
    {
      type: "All workers",
      m: 57791,
      f: 41518,
      age: "total",
    },
    {
      type: "Less than 9th grade",
      m: 26789,
      f: 20499,
      age: "total",
    },
    {
      type: "9th to 12th grade (no diploma)",
      m: 31434,
      f: 23351,
      age: "total",
    },
    {
      type: "High school graduate",
      m: 42466,
      f: 29410,
      age: "total",
    },
    {
      type: "Some college, no degree",
      m: 48431,
      f: 35916,
      age: "total",
    },
    {
      type: "Associate’s degree",
      m: 51485,
      f: 40463,
      age: "total",
    },
    {
      type: "Bachelor’s degree or more",
      m: 88843,
      f: 59052,
      age: "total",
    },
    {
      type: "All workers",
      m: 26170,
      f: 23462,
      age: "18 to 24 years old",
    },
    {
      type: "Less than 9th grade",
      m: 19361,
      f: null,
      age: "18 to 24 years old",
    },
    {
      type: "9th to 12th grade (no diploma)",
      m: 20918,
      f: 17514,
      age: "18 to 24 years old",
    },
    {
      type: "High school graduate",
      m: 24974,
      f: 20427,
      age: "18 to 24 years old",
    },
    {
      type: "Some college, no degree",
      m: 26957,
      f: 21822,
      age: "18 to 24 years old",
    },
    {
      type: "Associate’s degree",
      m: 29698,
      f: 26638,
      age: "18 to 24 years old",
    },
    {
      type: "Bachelor’s degree or more",
      m: 38275,
      f: 32865,
      age: "18 to 24 years old",
    },
    {
      type: "All workers",
      m: 46181,
      f: 38581,
      age: "25 to 34 years old",
    },
    {
      type: "Less than 9th grade",
      m: 23453,
      f: 18180,
      age: "25 to 34 years old",
    },
    {
      type: "9th to 12th grade (no diploma)",
      m: 29347,
      f: 21955,
      age: "25 to 34 years old",
    },
    {
      type: "High school graduate",
      m: 37181,
      f: 26299,
      age: "25 to 34 years old",
    },
    {
      type: "Some college, no degree",
      m: 41073,
      f: 32853,
      age: "25 to 34 years old",
    },
    {
      type: "Associate’s degree",
      m: 42357,
      f: 38857,
      age: "25 to 34 years old",
    },
    {
      type: "Bachelor’s degree or more",
      m: 67195,
      f: 50341,
      age: "25 to 34 years old",
    },
    {
      type: "All workers",
      m: 63247,
      f: 44183,
      age: "35 to 44 years old",
    },
    {
      type: "Less than 9th grade",
      m: 29302,
      f: 21152,
      age: "35 to 44 years old",
    },
    {
      type: "9th to 12th grade (no diploma)",
      m: 31018,
      f: 24637,
      age: "35 to 44 years old",
    },
    {
      type: "High school graduate",
      m: 45316,
      f: 30769,
      age: "35 to 44 years old",
    },
    {
      type: "Some college, no degree",
      m: 53080,
      f: 37323,
      age: "35 to 44 years old",
    },
    {
      type: "Associate’s degree",
      m: 58759,
      f: 41892,
      age: "35 to 44 years old",
    },
    {
      type: "Bachelor’s degree or more",
      m: 95002,
      f: 63427,
      age: "35 to 44 years old",
    },
    {
      type: "All workers",
      m: 67635,
      f: 45332,
      age: "45 to 54 years old",
    },
    {
      type: "Less than 9th grade",
      m: 28988,
      f: 21633,
      age: "45 to 54 years old",
    },
    {
      type: "9th to 12th grade (no diploma)",
      m: 35615,
      f: 24304,
      age: "45 to 54 years old",
    },
    {
      type: "High school graduate",
      m: 49199,
      f: 31984,
      age: "45 to 54 years old",
    },
    {
      type: "Some college, no degree",
      m: 56320,
      f: 39785,
      age: "45 to 54 years old",
    },
    {
      type: "Associate’s degree",
      m: 57363,
      f: 44191,
      age: "45 to 54 years old",
    },
    {
      type: "Bachelor’s degree or more",
      m: 101763,
      f: 65001,
      age: "45 to 54 years old",
    },
    {
      type: "All workers",
      m: 65956,
      f: 43870,
      age: "55 to 64 years old",
    },
    {
      type: "Less than 9th grade",
      m: 29913,
      f: 19681,
      age: "55 to 64 years old",
    },
    {
      type: "9th to 12th grade (no diploma)",
      m: 41136,
      f: 25078,
      age: "55 to 64 years old",
    },
    {
      type: "High school graduate",
      m: 47741,
      f: 31015,
      age: "55 to 64 years old",
    },
    {
      type: "Some college, no degree",
      m: 56120,
      f: 40749,
      age: "55 to 64 years old",
    },
    {
      type: "Associate’s degree",
      m: 51978,
      f: 39477,
      age: "55 to 64 years old",
    },
    {
      type: "Bachelor’s degree or more",
      m: 92223,
      f: 64054,
      age: "55 to 64 years old",
    },
    {
      type: "All workers",
      m: 58565,
      f: 38629,
      age: "65 years old and over",
    },
    {
      type: "Less than 9th grade",
      m: 26062,
      f: null,
      age: "65 years old and over",
    },
    {
      type: "9th to 12th grade (no diploma)",
      m: 32810,
      f: 27948,
      age: "65 years old and over",
    },
    {
      type: "High school graduate",
      m: 42766,
      f: 29170,
      age: "65 years old and over",
    },
    {
      type: "Some college, no degree",
      m: 51091,
      f: 43082,
      age: "65 years old and over",
    },
    {
      type: "Associate’s degree",
      m: 48347,
      f: 37079,
      age: "65 years old and over",
    },
    {
      type: "Bachelor’s degree or more",
      m: 85106,
      f: 58288,
      age: "65 years old and over",
    },
  ]

  const incdomain = (() => {
    const elements = []
      .concat(
        income.map((v) => v.m),
        income.map((v) => v.f)
      )
      .filter((v) => typeof v === "number")

    return [Math.min(...elements), Math.max(...elements)]
  })()

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
          paddingRight: 20,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current
          .link()
          .data([1])
          .encode("x", [() => incdomain[0], () => incdomain[1]])
          .encode("y", [() => incdomain[0], () => incdomain[1]])
          .tooltip(false)
          .label({
            position: "top-right",
            text: (v) => `${v * 100}%`,
            dx: 4,
            textAlign: "start",
            textBaseline: "middle",
          })
          .style("stroke", "#000")

        g2ChartInstance.current
          .link()
          .data([0.6, 0.7, 0.8, 0.9])
          .encode("x", [() => incdomain[0], () => incdomain[1]])
          .encode("y", [(v) => v * incdomain[0], (v) => v * incdomain[1]])
          .tooltip(false)
          .label({
            position: "top-right",
            text: (v) => `${v * 100}%`,
            dx: 4,
            textAlign: "start",
            textBaseline: "middle",
          })
          .style("stroke", "#000")
          .style("opacity", 0.2)

        g2ChartInstance.current
          .point()
          .data(income)
          .encode("x", "m")
          .encode("y", "f")
          .encode("size", 4)
          .encode("shape", "hollow")
          .style("stroke", "#000")

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/link/demo/link-annotation.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/link/demo/link-annotation.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/link/demo/link-annotation.ts:",
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
        <CardTitle>Link Annotation</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/link/demo/link-annotation.ts
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
