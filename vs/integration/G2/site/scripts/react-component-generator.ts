// @ts-nocheck
import path from 'path';
import { useShadcnChartColors } from "@/hooks/use-shadcn-chart-colors"; // Import the hook

// Fallback colors to be used in the template if hook fails or before it runs.
const FALLBACK_COLORS_JSON = JSON.stringify(['#E57373', '#81C784', '#64B5F6', '#FFD54F', '#BA68C8']);

export function getReactComponentTemplate(originalG2FilePath: string, cardTitle: string, chartIdBase: string, g2Logic: any, baseWorkspaceDir: string) {
    const relativeOriginalPath = path.relative(baseWorkspaceDir, originalG2FilePath);

    let finalImports = `import React, { useEffect, useRef } from "react";\n`;
    if (g2Logic.imports) {
        finalImports += `${g2Logic.imports}\n`;
    }
    // Removed conditional import for Chart from "@antv/g2"
    // if (!finalImports.includes("from \"@antv/g2\"") && g2Logic.g2Code.includes("new Chart(")) {
    //     finalImports += `import { Chart } from "@antv/g2";\n`
    // }

    let finalHelpers = g2Logic.helpers || ""; // Ensure finalHelpers is a string
    const defaultDataString = `const data = [
  { site: 'MN', variety: 'Manchuria', yield: 32.4, year: 1932 },
  { site: 'MN', variety: 'Manchuria', yield: 30.7, year: 1931 },
  { site: 'MN', variety: 'Glabron', yield: 33.1, year: 1932 },
  { site: 'MN', variety: 'Glabron', yield: 33, year: 1931 },
  { site: 'MN', variety: 'Svansota', yield: 29.3, year: 1932 },
  { site: 'MN', variety: 'Svansota', yield: 30.8, year: 1931 },
  { site: 'MN', variety: 'Velvet', yield: 32, year: 1932 },
  { site: 'MN', variety: 'Velvet', yield: 33.3, year: 1931 },
  { site: 'MN', variety: 'Peatland', yield: 30.5, year: 1932 },
  { site: 'MN', variety: 'Peatland', yield: 26.7, year: 1931 },
  { site: 'MN', variety: 'Trebi', yield: 31.6, year: 1932 },
  { site: 'MN', variety: 'Trebi', yield: 29.3, year: 1931 },
  { site: 'MN', variety: 'No. 457', yield: 31.9, year: 1932 },
  { site: 'MN', variety: 'No. 457', yield: 32.3, year: 1931 },
  { site: 'MN', variety: 'No. 462', yield: 29.9, year: 1932 },
  { site: 'MN', variety: 'No. 462', yield: 30.7, year: 1931 },
  { site: 'MN', variety: 'No. 475', yield: 28.1, year: 1932 },
  { site: 'MN', variety: 'No. 475', yield: 29.1, year: 1931 },
];`;

    const usesDataMethod = g2Logic.g2Code.includes(".data(");
    // Check if common data variable names are defined in helpers or g2Code
    const dataSourceDefinitionPattern = /(?:const|let|var)\s+(data|source|nodes|edges|values|points|poissonData|flareData|barleyData|unemployment|population)\s*=/m;
    const definesDataSourceInHelpers = dataSourceDefinitionPattern.test(finalHelpers);
    const definesDataSourceInG2Code = dataSourceDefinitionPattern.test(g2Logic.g2Code);

    if (usesDataMethod && !definesDataSourceInHelpers && !definesDataSourceInG2Code) {
        finalHelpers = `// Default data used as a fallback because no specific data source was detected:\n${defaultDataString}\n\n${finalHelpers}`;
    }

    return `// @ts-nocheck
"use client";

${finalImports}
import { useShadcnChartColors } from "@/hooks/use-shadcn-chart-colors"; // Import the hook
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/ui/card";

// Original G2 example path: ${relativeOriginalPath}

const FALLBACK_COLORS_JSON = '${FALLBACK_COLORS_JSON}';

export default function G2ChartComponent_${chartIdBase.replace(/-/g, '_')}() {
  // Helper functions and data extracted from the original G2 example.
  // These are defined within the component scope to be accessible by the G2 chart logic in useEffect.
${finalHelpers.split('\n').map(line => '  ' + line).join('\n')}

  const chartRef = useRef<HTMLDivElement>(null);
  const g2ChartInstance = useRef<Chart | null>(null);
  const shadcnColors = useShadcnChartColors(chartRef); // Use the hook

  useEffect(() => {
    // Palette registration must happen before G2 chart initialization attempts to use it.
    // It also needs to happen after shadcnColors are resolved.
    // And chartRef.current must exist for getComputedStyle to work in the hook.
    
    // Register the palette once colors are resolved (or with fallback).
    // Check if shadcnColors are not the initial fallback to ensure hook has run or CSS vars are applied.
    // The hook itself returns FALLBACK_COLORS initially or if resolution fails.
    if (shadcnColors && shadcnColors.length === 5) {
        try {
            register('palette.shadcnPalette', () => shadcnColors);
        } catch (e) {
            console.error("Error registering shadcnPalette, G2 'register' might not be available or shadcnColors are invalid:", e, shadcnColors);
            // Fallback registration if the above fails for any reason
            register('palette.shadcnPalette', () => JSON.parse(FALLBACK_COLORS_JSON));
        }
    } else {
        // Fallback if shadcnColors is not yet ready or invalid
        console.warn("Shadcn colors not ready or invalid, using fallback palette for G2 chart.");
        register('palette.shadcnPalette', () => JSON.parse(FALLBACK_COLORS_JSON));
    }

    if (chartRef.current && !g2ChartInstance.current) {
      try {
        // --- G2 Chart Logic Start ---
${g2Logic.g2Code.split('\n').map(line => '        ' + line).join('\n')}
        // --- G2 Chart Logic End ---
      } catch (error) {
        console.error("Error initializing G2 chart from ${relativeOriginalPath}:", error);
        if (chartRef.current) {
          chartRef.current.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Failed to render G2 chart. Check console for errors. Source: ${relativeOriginalPath}</div>';
        }
      }
    }

    return () => {
      if (g2ChartInstance.current) {
        try {
          g2ChartInstance.current.destroy();
        } catch (e) {
          console.error("Error destroying G2 chart from ${relativeOriginalPath}:", e);
        }
        g2ChartInstance.current = null;
      }
    };
  }, [shadcnColors]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>${cardTitle}</CardTitle>
        <CardDescription>
          G2 Chart. Original example: ${relativeOriginalPath.replace(/^integration\/G2\/site\/examples\//, '')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: '100%', minHeight: '400px' }}>
          {/* G2 Chart will be rendered here by the useEffect hook */}
        </div>
      </CardContent>
    </Card>
  );
}
`;
}
