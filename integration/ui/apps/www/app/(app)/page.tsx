'use client'

import React from 'react'
import { Input } from '@/registry/default/ui/input' // Assuming shadcn Input is here
import { useBackgroundStore } from '@/lib/backgroundStore' // Adjusted path

export default function IndexPage() {
  const { setFile, isLoading, backgroundSrc, fileType, clearBackground } = useBackgroundStore()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    } else {
      setFile(null) // Clear if no file is selected or selection is cancelled
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 bg-pind-500">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-center text-2xl font-bold">Set Page Background</h1>
        <Input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="w-full"
        />
        {isLoading && <p className="text-center text-sm text-muted-foreground">Loading...</p>}
        {backgroundSrc && (
          <div className="mt-4 text-center">
            <p className="text-sm">Current background: {fileType}</p>
            <button
              onClick={clearBackground}
              className="mt-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              disabled={isLoading}
            >
              Clear Background
            </button>
          </div>
        )}
      </div>

      <div className="h-64 w-64 bg-background rounded-md border mt-4 flex items-center justify-center text-center p-4">
        Background is not having any blur effects
      </div>
    </div>
  )
}
