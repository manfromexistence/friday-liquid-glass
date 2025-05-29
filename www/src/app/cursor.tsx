"use client";

import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea"; // Changed from Input
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Particle {
    id: number;
    x: number;
    y: number;
    style: React.CSSProperties;
    type: string;
}

// Define color palettes using shadcn/ui CSS variables
// const particleColors = { // This can be removed or kept if used elsewhere, but not for effectColorPalettes
//     primary: 'hsl(var(--primary))',
//     secondary: 'hsl(var(--secondary))',
//     accent: 'hsl(var(--accent))',
//     destructive: 'hsl(var(--destructive))',
//     warning: 'hsl(var(--warning))'
// };

const effectColorPalettes: Record<string, string[]> = {
    particles: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'], // Red, Green, Blue, Yellow, Magenta, Cyan
    fireworks: ['#FFD700', '#FFA500', '#FF4500', '#FF69B4', '#ADD8E6', '#FFFFFF'], // Gold, Orange, OrangeRed, HotPink, LightBlue, White
    flames: ['#FF4500', '#FFA500', '#FFD700', '#DC143C'], // OrangeRed, Orange, Gold, Crimson
    magic: ['#8A2BE2', '#4B0082', '#9400D3', '#00FA9A', '#AFEEEE'], // BlueViolet, Indigo, DarkViolet, MediumSpringGreen, PaleTurquoise
    rift: ['#483D8B', '#000080', '#E0FFFF', '#FF00FF'] // DarkSlateBlue, Navy, LightCyan, Magenta
};

const effectOptions = [
    { value: "none", label: "None" },
    { value: "particles", label: "Particles" },
    { value: "fireworks", label: "Fireworks" },
    { value: "flames", label: "Flames" },
    { value: "magic", label: "Magic" },
    { value: "rift", label: "Rift" },
];

export function Cursor() {
    const [inputValue, setInputValue] = useState("");
    const [selectedEffect, setSelectedEffect] = useState("none");
    const [animations, setAnimations] = useState<Particle[]>([]);
    const animationIdCounter = useRef(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const getRandomColorFromPalette = (effectType: string): string => {
        const palette = effectColorPalettes[effectType];
        if (!palette || palette.length === 0) return 'hsl(var(--primary))'; // Default fallback
        return palette[Math.floor(Math.random() * palette.length)];
    };

    const createParticle = (): Particle | null => {
        const newParticleId = animationIdCounter.current++;
        const textareaRect = textareaRef.current?.getBoundingClientRect();
        
        // Position particles near the top-left of the textarea.
        // Precise cursor tracking is complex in a standard textarea.
        const startX = textareaRect ? textareaRect.left + window.scrollX + 20 : window.innerWidth / 2; // Approx 20px from left
        const startY = textareaRect ? textareaRect.top + window.scrollY + 15 : window.innerHeight / 2; // Approx 15px from top

        let particleStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${startX + Math.random() * 20 - 10}px`, // Spread around startX
            top: `${startY + Math.random() * 20 - 10}px`,  // Spread around startY
            opacity: 1,
        };
        let particleType = selectedEffect;
        let color = getRandomColorFromPalette(selectedEffect);

        switch (selectedEffect) {
            case "particles":
                color = getRandomColorFromPalette("particles"); // Ensure color is from palette
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 5 + 3}px`,
                    height: `${Math.random() * 5 + 3}px`,
                    backgroundColor: color,
                    borderRadius: '50%',
                    animation: `particle-effect 1s ease-out forwards`, // Use standard particle animation
                };
                break;
            case "fireworks":
                color = getRandomColorFromPalette("fireworks");
                particleStyle = {
                    ...particleStyle,
                    width: '2px',
                    height: `${Math.random() * 8 + 7}px`,
                    backgroundColor: color,
                    animation: `firework-particle-effect 0.8s ease-out forwards`,
                };
                break;
            case "flames":
                color = getRandomColorFromPalette("flames");
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 5 + 5}px`,
                    height: `${Math.random() * 10 + 10}px`,
                    backgroundColor: color,
                    borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%',
                    transformOrigin: 'bottom center',
                    animation: `flame-effect 0.7s ease-out forwards`,
                };
                break;
            case "magic":
                const magicColor = getRandomColorFromPalette("magic");
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 4 + 3}px`,
                    height: `${Math.random() * 4 + 3}px`,
                    backgroundColor: magicColor,
                    boxShadow: `0 0 5px ${magicColor}, 0 0 10px ${magicColor}`,
                    borderRadius: '50%',
                    animation: `magic-effect 0.7s ease-out forwards`,
                };
                particleType = "magic";
                break;
            case "rift":
                color = getRandomColorFromPalette("rift");
                particleStyle = {
                    ...particleStyle,
                    width: '1px',
                    height: `${Math.random() * 20 + 15}px`,
                    backgroundColor: color,
                    animation: `rift-effect 0.5s ease-in-out forwards`,
                    transform: `rotate(${Math.random() * 90 - 45}deg)`, // Keep initial random rotation here
                };
                particleType = "rift";
                break;
            default:
                return null;
        }

        return {
            id: newParticleId,
            x: 0,
            y: 0,
            style: particleStyle,
            type: particleType,
        };
    };

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(event.target.value);
        if (selectedEffect !== "none") {
            // Reverted debug particle count for "particles" to a sensible default (e.g., 3)
            const numParticles = selectedEffect === "fireworks" ? 5 : (selectedEffect === "flames" ? 2 : (selectedEffect === "rift" ? 1 : (selectedEffect === "particles" ? 3 : 3)));
            const newParticles = Array.from({ length: numParticles })
                .map(() => createParticle())
                .filter(p => p !== null) as Particle[];

            setAnimations(prev => [...prev, ...newParticles]);

            newParticles.forEach(p => {
                let duration = 700;
                // Reverted debug duration for "particles"
                if (p.type === "particles") duration = 1000;
                else if (p.type === "fireworks") duration = 800;
                else if (p.type === "flames") duration = 700;
                else if (p.type === "magic") duration = 700;
                else if (p.type === "rift") duration = 500;

                setTimeout(() => {
                    setAnimations(currentAnims => currentAnims.filter(anim => anim.id !== p.id));
                }, duration);
            });
        }
    };

    return (
        <div className="p-4 flex flex-col items-center space-y-4 min-h-screen bg-background text-foreground">
            <h1 className="text-3xl font-bold my-6">Power Input FX</h1>
            <div className="w-full max-w-md bg-card text-card-foreground p-6 rounded-lg shadow-xl border border-border">
                <Select onValueChange={setSelectedEffect} defaultValue="none">
                    <SelectTrigger className="w-full bg-input border-border text-foreground">
                        <SelectValue placeholder="Select an effect" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                        {effectOptions.map(option => (
                            <SelectItem key={option.value} value={option.value} className="hover:bg-accent focus:bg-accent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Textarea // Changed from Input to Textarea
                ref={textareaRef} // Changed ref name
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type here to unleash the power..."
                className="w-full max-w-md text-center bg-input border-border text-foreground placeholder:text-muted-foreground text-lg p-3 rounded-md shadow-lg focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
            />

            {/* Animation container */}
            <div id="animation-container" className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]">
                {animations.map(anim => (
                    <div key={anim.id} style={anim.style} />
                ))}
            </div>

            {/* Global styles for animations */}
            <style jsx global>{`
                @keyframes particle-debug-effect { /* This can be removed if no longer used */
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: translate(0, 20px) scale(1.2);
                        opacity: 0.5;
                    }
                    100% {
                        transform: translate(0, 40px) scale(0);
                        opacity: 0;
                    }
                }
                @keyframes particle-effect {
                    0% {
                        transform: scale(1); /* Start at its initial randomized (left, top) pos via style prop */
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-70px) scale(0); /* General upward movement */
                        opacity: 0;
                    }
                }
                @keyframes firework-particle-effect {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    20% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) scale(0.3); /* Shoots up and shrinks */
                        opacity: 0;
                    }
                }
                @keyframes flame-effect {
                    0% {
                        transform: translateY(0) scaleY(1) scaleX(1) skewX(0deg);
                        opacity: 0.8;
                    }
                    50% {
                        transform: translateY(-35px) scaleY(1.3) scaleX(0.7) skewX(-8deg); /* Flicker up */
                        opacity: 0.5;
                    }
                    100% {
                        transform: translateY(-80px) scaleY(0.4) scaleX(0.2) skewX(8deg); /* Fade out higher */
                        opacity: 0;
                    }
                }
                @keyframes magic-effect {
                    0% {
                        transform: scale(0.3) rotate(0deg);
                        opacity: 0; /* Start almost invisible and small */
                    }
                    50% {
                        transform: scale(1.2) rotate(180deg); /* Grow, rotate, become fully visible */
                        opacity: 1;
                    }
                    100% {
                        transform: scale(0.3) rotate(360deg); /* Shrink, continue rotation, fade out */
                        opacity: 0;
                    }
                }
                @keyframes rift-effect { /* Initial rotation is applied via inline style in createParticle */
                    0% {
                        transform: scaleX(0.1); 
                        opacity: 0.5;
                    }
                    50% {
                        transform: scaleX(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scaleX(0.1);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}