'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useBackgroundStore } from '@/lib/backgroundStore';

export function BackgroundThemeManager() {
  const { backgroundSrc } = useBackgroundStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const previousThemeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (backgroundSrc) {
      // Store current theme before switching, only if not already glassmorphism
      // and also ensure we are not trying to store 'glassmorphism' itself as previous theme
      if (theme !== 'glassmorphism' && resolvedTheme !== 'glassmorphism') {
        previousThemeRef.current = theme === 'system' ? resolvedTheme : theme;
      }
      // Only switch if not already glassmorphism
      if (theme !== 'glassmorphism') {
        setTheme('glassmorphism');
      }
    } else {
      // Revert to previous theme or default to 'system' only if current theme is glassmorphism
      if (theme === 'glassmorphism') {
        setTheme(previousThemeRef.current || 'system');
        previousThemeRef.current = undefined; // Clear stored theme
      }
    }
  }, [backgroundSrc, setTheme, theme, resolvedTheme]);

  return null; // This component does not render anything
}
