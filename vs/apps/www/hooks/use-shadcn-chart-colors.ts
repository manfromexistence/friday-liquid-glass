import { useEffect, useState, RefObject } from 'react';

// Fallback colors if CSS variables cannot be resolved
const FALLBACK_COLORS = ['#E57373', '#81C784', '#64B5F6', '#FFD54F', '#BA68C8'];
const CHART_COLOR_VARIABLES = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];

export function useShadcnChartColors(chartRef: RefObject<HTMLElement | null>): string[] {
  const [resolvedColors, setResolvedColors] = useState<string[]>(FALLBACK_COLORS);

  useEffect(() => {
    const currentChartRef = chartRef.current; // Capture current value for the effect closure
    if (currentChartRef && typeof getComputedStyle === 'function') {
      try {
        const computedStyles = getComputedStyle(currentChartRef);
        let allVarsResolved = true;
        const colors = CHART_COLOR_VARIABLES.map(cssVar => {
          const hslRaw = computedStyles.getPropertyValue(cssVar.trim()).trim();
          if (hslRaw) {
            const parts = hslRaw.split(' ').map(p => p.trim());
            if (parts.length === 3) {
              const h = parts[0];
              const s = parts[1].endsWith('%') ? parts[1] : parts[1] + '%';
              const l = parts[2].endsWith('%') ? parts[2] : parts[2] + '%';
              return `hsl(${h}, ${s}, ${l})`;
            }
            return hslRaw; 
          }
          allVarsResolved = false;
          console.warn(`CSS variable ${cssVar} not found. Using fallback for this color.`);
          return '#CCCCCC'; // Individual fallback
        });
        
        // Only update if all variables were resolved and colors actually changed,
        // or if we are moving from initial fallback to resolved colors.
        if (allVarsResolved && JSON.stringify(colors) !== JSON.stringify(resolvedColors)) {
          setResolvedColors(colors);
        } else if (!allVarsResolved && JSON.stringify(resolvedColors) !== JSON.stringify(FALLBACK_COLORS)) {
          // If some vars are not resolved, and we are not already on full fallback, revert to full fallback.
          // This handles cases where styles might temporarily be unavailable.
          // setResolvedColors(FALLBACK_COLORS); // Or keep individual fallbacks as per current logic.
          // For now, let's stick to individual fallbacks and only update if the array content differs.
           if (JSON.stringify(colors) !== JSON.stringify(resolvedColors)) {
            setResolvedColors(colors);
           }
        }

      } catch (error) {
        console.error("Error resolving CSS chart colors:", error);
        if (JSON.stringify(FALLBACK_COLORS) !== JSON.stringify(resolvedColors)) {
          setResolvedColors(FALLBACK_COLORS);
        }
      }
    } else if (JSON.stringify(resolvedColors) !== JSON.stringify(FALLBACK_COLORS)) {
        // If chartRef is null (e.g., unmounted) and we are not on fallbacks, reset to fallbacks.
        // This might be too aggressive, consider if needed. For now, mostly handles initial state.
    }
    // Dependency: chartRef.current to re-run when the ref element is available/changes.
    // resolvedColors is not added to avoid loops; the internal check `JSON.stringify(colors) !== JSON.stringify(resolvedColors)` handles this.
  }, [chartRef.current]); 

  return resolvedColors;
}
