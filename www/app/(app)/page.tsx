"use client"

import * as React from "react"
import AiInput from '@/components/ai-input'
import Friday from "@/components/friday/friday"
import { useAuth } from "@/contexts/auth-context"
import PersonaSelector from "@/components/persona-suggestion"
import SearchSuggestions from "@/components/search-suggestions"
import Chat from "@/components/chat"
import RainbowMeshAnimation from '@/components/RainbowMeshAnimation';
import MeshGenerator from '@/components/MeshGenerator';

export default function Home() {
  const { user } = useAuth()
  const userName = user?.displayName || "friend"

  // Using useState and useEffect to ensure client-side only rendering of time-based content
  const [greeting, setGreeting] = React.useState("")
  // Add state to track if input has been submitted
  const [hasSubmitted, setHasSubmitted] = React.useState(false)
  // Keep track of current input for search suggestions
  const [currentInput, setCurrentInput] = React.useState("")

  // Reference to the AiInput component
  const aiInputRef = React.useRef<{ setValue: (value: string) => void } | null>(null)

  React.useEffect(() => {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning")
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }
  }, [])

  // Reset hasSubmitted when input is cleared
  React.useEffect(() => {
    if (!currentInput.trim()) {
      setHasSubmitted(false);
    }
  }, [currentInput]);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    // Update the input with the suggestion
    if (aiInputRef.current) {
      aiInputRef.current.setValue(suggestion);
    }
  };

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-4 py-4 pt-16">
      {/* <Friday orbSize={100} shapeSize={90} />  */}
      <h1 className="bold w-full text-center font-sans text-3xl">
        {greeting && `${greeting}, ${userName}.`}
      </h1>
      {/* 
            <AiInput
        ref={aiInputRef}
        onInputChange={setCurrentInput}
        onSubmit={() => setHasSubmitted(true)}
      />
      <div className="animated-mesh-glow">Animation</div> */}
      {/* <RainbowMeshAnimation /> */}
      {/* <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <h1 className="text-3xl font-bold mb-8 text-center">Mesh Generator</h1>
        <p className="text-muted-foreground max-w-md text-center mb-8">
          Create beautiful gradient meshes with customizable filters. Adjust grain, blur, contrast, brightness, and hue to create your perfect pattern.
        </p>
        <div className="flex flex-col items-center">
          <MeshGenerator />
        </div>
      </div> */}
    </div>
  )
}
