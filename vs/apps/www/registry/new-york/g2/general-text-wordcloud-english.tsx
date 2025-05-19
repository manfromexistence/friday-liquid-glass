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

// Original G2 example path: integration/G2/site/examples/general/text/demo/wordCloud-english.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_text_wordcloud_english() {
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
   * A recreation of this demo: // https://www.jasondavies.com/wordcloud/
   */

  const Word = {
    "32": 2,
    word: 10,
    cloud: 1,
    generator: 1,
    works: 1,
    layout: 4,
    algorithm: 4,
    positioning: 1,
    words: 8,
    without: 3,
    overlap: 1,
    available: 1,
    github: 1,
    open: 1,
    source: 1,
    license: 1,
    d3cloud: 1,
    note: 1,
    code: 1,
    converting: 1,
    text: 1,
    rendering: 1,
    final: 1,
    output: 1,
    requires: 1,
    additional: 1,
    development: 1,
    placement: 2,
    quite: 1,
    slow: 1,
    hundred: 1,
    run: 1,
    asynchronously: 1,
    configurable: 1,
    time: 2,
    step: 3,
    size: 1,
    makes: 1,
    possible: 2,
    animate: 1,
    placed: 5,
    stuttering: 1,
    recommended: 1,
    always: 1,
    use: 1,
    even: 2,
    animations: 1,
    prevents: 1,
    browsers: 1,
    event: 1,
    loop: 1,
    blocking: 1,
    placing: 1,
    incredibly: 1,
    simple: 2,
    starting: 2,
    important: 1,
    attempt: 1,
    place: 1,
    point: 1,
    usually: 1,
    near: 1,
    middle: 1,
    somewhere: 1,
    central: 1,
    horizontal: 1,
    line: 1,
    intersects: 1,
    previously: 2,
    move: 2,
    one: 1,
    along: 1,
    increasing: 1,
    spiral: 1,
    repeat: 1,
    intersections: 1,
    found: 1,
    hard: 1,
    part: 1,
    making: 1,
    perform: 2,
    efficiently: 1,
    according: 1,
    jonathan: 1,
    feinberg: 1,
    wordle: 1,
    uses: 1,
    combination: 1,
    hierarchical: 2,
    bounding: 3,
    boxes: 1,
    quadtrees: 1,
    achieve: 1,
    reasonable: 1,
    speeds: 1,
    glyphs: 1,
    javascript: 1,
    isnt: 1,
    way: 1,
    retrieve: 3,
    precise: 1,
    glyph: 1,
    shapes: 1,
    via: 1,
    dom: 1,
    except: 1,
    perhaps: 1,
    svg: 1,
    fonts: 1,
    instead: 1,
    draw: 2,
    hidden: 1,
    canvas: 1,
    element: 1,
    pixel: 2,
    data: 2,
    retrieving: 1,
    separately: 2,
    expensive: 2,
    many: 1,
    pixels: 2,
    batch: 1,
    operation: 3,
    sprites: 1,
    masks: 2,
    initial: 1,
    implementation: 2,
    performed: 1,
    collision: 3,
    detection: 2,
    using: 1,
    sprite: 7,
    doesnt: 1,
    copy: 1,
    appropriate: 1,
    position: 1,
    larger: 2,
    representing: 1,
    whole: 2,
    area: 4,
    advantage: 1,
    involves: 1,
    comparing: 2,
    candidate: 3,
    relevant: 1,
    rather: 1,
    previous: 1,
    somewhat: 1,
    surprisingly: 1,
    lowlevel: 1,
    hack: 1,
    made: 1,
    tremendous: 1,
    difference: 1,
    constructing: 1,
    compressed: 1,
    blocks: 1,
    "1bit": 1,
    "32bit": 1,
    integers: 1,
    thus: 1,
    reducing: 1,
    number: 1,
    checks: 1,
    memory: 1,
    times: 1,
    fact: 1,
    turned: 1,
    beat: 1,
    box: 2,
    quadtree: 1,
    everything: 1,
    tried: 1,
    large: 2,
    areas: 1,
    font: 1,
    sizes: 1,
    think: 2,
    primarily: 1,
    version: 2,
    needs: 1,
    single: 2,
    test: 1,
    per: 1,
    whereas: 1,
    compare: 1,
    every: 1,
    overlaps: 1,
    slightly: 1,
    another: 1,
    possibility: 1,
    merge: 1,
    tree: 2,
    fairly: 1,
    though: 1,
    compared: 1,
    analagous: 1,
    mask: 1,
    essentially: 1,
    oring: 1,
    block: 1,
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
        g2ChartInstance.current
          .wordCloud()
          .data(Object.entries(Word).map(([text, value]) => ({ text, value })))
          .layout({
            fontSize: [20, 100],
          })
          .encode("color", "text")
          .legend(false)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/text/demo/wordCloud-english.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/text/demo/wordCloud-english.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/text/demo/wordCloud-english.ts:",
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
        <CardTitle>English WordCloud</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/text/demo/wordCloud-english.ts
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
