'use client';

import React from 'react';
import { useBackgroundStore } from '@/lib/backgroundStore';
import { cn } from '@/lib/utils';

export function BackgroundDisplay() {
  const { backgroundSrc, fileType } = useBackgroundStore();

  return (
    <div
      className={cn(
        'fixed inset-0 z-[-1] overflow-hidden',
        !backgroundSrc && 'bg-background'
      )}
    >
      {backgroundSrc && fileType === 'image' && (
        <img
          src={backgroundSrc}
          alt="Background"
          className="h-full w-full object-cover"
        />
      )}
      {backgroundSrc && fileType === 'video' && (
        <video
          src={backgroundSrc}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

