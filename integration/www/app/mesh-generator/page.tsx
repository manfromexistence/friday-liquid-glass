"use client"

import React from 'react';
import MeshGenerator from '@/components/MeshGenerator';

export default function MeshGeneratorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <h1 className="text-3xl font-bold mb-8 text-center">Mesh Generator</h1>
      <p className="text-muted-foreground max-w-md text-center mb-8">
        Create beautiful gradient meshes with customizable filters. Adjust grain, blur, contrast, brightness, and hue to create your perfect pattern.
      </p>
      <div className="flex flex-col items-center">
        <MeshGenerator />
      </div>
    </div>
  );
}
