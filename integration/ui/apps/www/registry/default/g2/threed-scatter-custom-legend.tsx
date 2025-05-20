// @ts-nocheck
"use client"

import React, { useEffect, useRef } from "react"
import { CameraType } from "@antv/g"
import { Runtime, corelib, extend, register } from "@antv/g2"
import { threedlib } from "@antv/g2-extension-3d"
import { DirectionalLight, Plugin as ThreeDPlugin } from "@antv/g-plugin-3d"
import { Plugin as ControlPlugin } from "@antv/g-plugin-control"
import { Renderer as WebGLRenderer } from "@antv/g-webgl"

import { useShadcnChartColors } from "@/hooks/use-shadcn-chart-colors"
// Import the hook
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/ui/card"

// Original G2 example path: integration/G2/site/examples/threed/scatter/demo/custom-legend.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_threed_scatter_custom_legend() {
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

  // Helper function for legend, now accepts the chart instance as parameter
  function legendColor(chart) {
    const node = chart.getContainer()
    const legend = document.createElement("div")
    legend.style.display = "flex"
    node.insertBefore(legend, node.childNodes[0])

    const { color: scale } = chart.getScale()
    const { domain } = scale.getOptions()
    const items = domain.map((value) => {
      const item = document.createElement("div")
      const color = scale.map(value)
      item.style.marginLeft = "1em"
      item.innerHTML = `
      <span style="
        background-color:${color};
        display:inline-block;
        width:10px;
        height:10px;"
      ></span>
      <span>${value}</span>
      `
      return item
    })
    items.forEach((d) => legend.append(d))

    const selectedValues = [...domain]
    const options = chart.options()
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const value = domain[i]
      item.style.cursor = "pointer"
      item.onclick = () => {
        const index = selectedValues.indexOf(value)
        if (index !== -1) {
          selectedValues.splice(index, 1)
          item.style.opacity = 0.5
        } else {
          selectedValues.push(value)
          item.style.opacity = 1
        }
        changeColor(selectedValues)
      }
    }

    function changeColor(value) {
      const { transform = [] } = options
      const newTransform = [{ type: "filter", color: { value } }, ...transform]
      chart.options({
        ...options,
        transform: newTransform, // 指定新的 transform
        scale: { color: { domain } },
      })
      chart.render() // 重新渲染图表
    }
  }

  // Create a WebGL renderer.
  const renderer = new WebGLRenderer()
  renderer.registerPlugin(new ThreeDPlugin())
  renderer.registerPlugin(new ControlPlugin())

  // Customize our own Chart with threedlib.
  const Chart = extend(Runtime, { ...corelib(), ...threedlib() })

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
          renderer,
          depth: 400, // Define the depth of chart.
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current
          .point3D()
          .data({
            type: "fetch",
            value:
              "https://gw.alipayobjects.com/os/bmw-prod/2c813e2d-2276-40b9-a9af-cf0a0fb7e942.csv",
          })
          .encode("x", "Horsepower")
          .encode("y", "Miles_per_Gallon")
          .encode("z", "Weight_in_lbs")
          .encode("color", "Origin")
          .coordinate({ type: "cartesian3D" })
          .scale("x", { nice: true })
          .scale("y", { nice: true })
          .scale("z", { nice: true })
          .legend(false)
          .axis("x", { gridLineWidth: 2 })
          .axis("y", { gridLineWidth: 2, titleBillboardRotation: -Math.PI / 2 })
          .axis("z", { gridLineWidth: 2 })
        g2ChartInstance.current.render().then(() => {
          legendColor(g2ChartInstance.current)
          const { canvas } = g2ChartInstance.current.getContext()
          const camera = canvas.getCamera()
          camera.setPerspective(0.1, 5000, 45, 640 / 480)
          camera.setType(CameraType.ORBITING)
          const light = new DirectionalLight({
            style: {
              intensity: 3,
              fill: "white",
              direction: [-1, 0, 1],
            },
          })
          canvas.appendChild(light)
        })
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/threed/scatter/demo/custom-legend.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/threed/scatter/demo/custom-legend.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/threed/scatter/demo/custom-legend.ts:",
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
        <CardTitle>Customize legend</CardTitle>
        <CardDescription>
          G2 Chart. Original example: threed/scatter/demo/custom-legend.ts
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
