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

// Original G2 example path: integration/G2/site/examples/general/image/demo/contributor.ts

const FALLBACK_COLORS_JSON =
  '["#E57373","#81C784","#64B5F6","#FFD54F","#BA68C8"]'

export default function G2ChartComponent_general_image_contributor() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
  // Code from original script before chart initialization:
  const Avatars = [
    "https://gw.alipayobjects.com/zos/antfincdn/z8eXl6l9GM/aiyin.jpg",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*cu6GQ7yNpJIAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*IFYESbDDqI0AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*z6bUQ7bvuAYAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*zIFOTbhtCoMAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*z9SnQpiMnIgAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*aGTWQKFIx2cAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/zos/antfincdn/n%26uTxqsNHe/IMG_3154.JPG",
    "http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/antfincdn/sX13FkC4%26C/erling.jpg",
    "https://gw.alipayobjects.com/zos/antfincdn/4VUXCQEiBd/c4f901c7-f591-4616-8dfc-83aecf839cd8.png",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*5kqTSZE-9KMAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*_OhHTo0gxAMAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/zos/antfincdn/aXQ3OTu6Er/IMG_3509.JPG",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*blSIQbwdOqsAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*rVgGS5sJwHQAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*gB63QppvTsgAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/zos/antfincdn/AefmmqKied/3ca2b3d8-e568-4bec-b10d-e4e432cb6f23.png",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*iBIzSZMCWRcAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*GHQQQYTL4g8AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*VXoNRoRXPBwAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*WZcQRJtWWlIAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*-wAXRKlOrW4AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*LSpRS6i_WOcAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*23r_SpWxPdEAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*R3QzTpZM7IUAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*vU-mRr0XrfcAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*LMcOQKUxbUEAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*8CiTTqjnzcEAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/zos/antfincdn/smBVaflWk5/my.jpg",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*V7E0RqRAlG4AAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*_E0SR4LCxaAAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*PmifSa53auQAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*mWkGRqxLexYAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*CPXKQ76YlfwAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/zos/antfincdn/c9K5r1m%26y9/d0b8a090-f034-43e6-aeeb-f59cb6c7c33c.png",
    "https://gw.alipayobjects.com/zos/antfincdn/L%261dAufvjL/IMG_1477.JPG",
    "https://gw.alipayobjects.com/zos/antfincdn/NkfCEL7RTL/7cdd44fc-8624-4b6c-8947-67f78e79142f.png",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*dl_gToTY6msAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*QFEMTaidg9QAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/zos/antfincdn/KGawdl9Ahq/touxiang.JPG",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*y1cFS4MDmPIAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_23b644/afts/img/A*qykaTLGttsgAAAAAAAAAAABkARQnAQ",
    "https://gw.alipayobjects.com/zos/antfincdn/QL5d8rcf%24M/IMG_6534.JPG",
    "https://gw.alipayobjects.com/mdn/rms_04a9e5/afts/img/A*ZmohRYwarWcAAAAAAAAAAAAAARQnAQ",
    "https://gw.alipayobjects.com/mdn/rms_04a9e5/afts/img/A*1O_3R4Wcwy0AAAAAAAAAAAAAARQnAQ",
  ]

  // Code from https://juejin.cn/post/6995818748191981604
  function getLovePoints() {
    let angle = 0
    let x = 0
    let y = 0
    const a = 6
    const points = []
    for (let i = 0; i < 20; i += 0.2) {
      angle = i / Math.PI
      x = a * (16 * Math.sin(angle) ** 3)
      y =
        a *
        (13 * Math.cos(angle) -
          5 * Math.cos(2 * angle) -
          2 * Math.cos(3 * angle) -
          Math.cos(4 * angle))
      points.push({ x, y })
    }
    return points
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
          padding: 40,
        })
        g2ChartInstance.current.theme({
          defaultCategory10: "shadcnPalette",
          defaultCategory20: "shadcnPalette",
        })
        g2ChartInstance.current.data(getLovePoints())

        g2ChartInstance.current
          .image()
          .encode("x", "x")
          .encode("y", "y")
          .encode("src", (_, idx) => Avatars[idx % Avatars.length])
          .encode("size", 48)
          .style({
            opacity: 0.7,
            shadowColor: "#fad7e0",
            shadowBlur: 40,
            shadowOffsetY: 20,
          })
          .axis(false)
          .tooltip(false)

        g2ChartInstance.current.render()
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error(
          "Error initializing G2 chart from integration/G2/site/examples/general/image/demo/contributor.ts:",
          error
        )
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: integration/G2/site/examples/general/image/demo/contributor.ts</div>'
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy()
        } catch (e) {
          console.error(
            "Error destroying G2 chart from integration/G2/site/examples/general/image/demo/contributor.ts:",
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
        <CardTitle>Contributor</CardTitle>
        <CardDescription>
          G2 Chart. Original example: general/image/demo/contributor.ts
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
