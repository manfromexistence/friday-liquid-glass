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
} from "@/registry/new-york/ui/card"

// Original G2 example path: integration/G2/site/examples/threed/bar/demo/cylinder.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_threed_bar_cylinder() {
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
  // Create a WebGL renderer.
  const renderer = new WebGLRenderer()
  renderer.registerPlugin(new ThreeDPlugin())
  renderer.registerPlugin(new ControlPlugin())

  // Customize our own Chart with threedlib.
  const Chart = extend(Runtime, { ...corelib(), ...threedlib() })

  const chartRef = useRef<HTMLDivElement>(null)
  const g2ChartInstance = useRef<ReturnType<typeof Chart> | null>(null)
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
          renderer,
          depth: 400,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        const data = []
        for (let x = 0; x < 5; ++x) {
          for (let z = 0; z < 5; ++z) {
            data.push({
              x: `x-${x}`,
              z: `z-${z}`,
              y: 10 - x - z,
              color: Math.random() < 0.33 ? 0 : Math.random() < 0.67 ? 1 : 2,
            })
          }
        }
        g2ChartInstance.current
          .interval3D()
          .data({ type: "inline", value: data })
          .encode("x", "x")
          .encode("y", "y")
          .encode("z", "z")
          .encode("color", "color")
          .encode("shape", "cylinder")
          .coordinate({ type: "cartesian3D" })
          .scale("x", { nice: true })
          .scale("y", { nice: true })
          .scale("z", { nice: true })
          .legend(false)
          .axis("x", { gridLineWidth: 2 })
          .axis("y", { gridLineWidth: 2, titleBillboardRotation: -Math.PI / 2 })
          .axis("z", { gridLineWidth: 2 })
          .style("opacity", 0.7)
        g2ChartInstance.current.render().then(() => {
          const { canvas } = g2ChartInstance.current.getContext()
          const camera = canvas.getCamera()
          camera.setPerspective(0.1, 5000, 45, 640 / 480)
          camera.rotate(-40, 30, 0)
          camera.dolly(70)
          camera.setType(CameraType.ORBITING)
          const light = new DirectionalLight({
            style: {
              intensity: 2.5,
              fill: "white",
              direction: [-1, 0, 1],
            },
          })
          canvas.appendChild(light)
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
        <CardTitle>Cylinder</CardTitle>
        <CardDescription>
          G2 Chart. Original example: threed/bar/demo/cylinder.ts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: "100%", minHeight: "400px" }} />
      </CardContent>
    </Card>
  )
}
