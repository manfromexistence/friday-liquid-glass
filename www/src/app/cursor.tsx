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
const particleColors = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    warning: 'hsl(var(--warning))' // Assuming you have a warning color or use another like accent
};

const effectColorPalettes: Record<string, string[]> = {
    particles: [particleColors.primary, particleColors.secondary, particleColors.accent],
    fireworks: ['hsl(var(--primary))', 'hsl(var(--primary-foreground))', 'hsl(var(--accent))' ], // Example: using primary, its foreground, and accent
    flames: ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--destructive-foreground))' ], // Example: using destructive, warning, and destructive foreground
    magic: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))' ], // Similar to particles but could have different animation
    rift: ['hsl(var(--muted-foreground))', 'hsl(var(--border))', 'hsl(var(--foreground))' ] // More subtle, glitchy colors
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
    const textareaRef = useRef<HTMLTextAreaElement>(null); // Changed from inputRef and HTMLInputElement

    const getRandomColorFromPalette = (effectType: string): string => {
        const palette = effectColorPalettes[effectType];
        if (!palette || palette.length === 0) return 'hsl(var(--primary))'; // Default fallback
        return palette[Math.floor(Math.random() * palette.length)];
    };

    const createParticle = (): Particle | null => {
        const newParticleId = animationIdCounter.current++;
        const textareaRect = textareaRef.current?.getBoundingClientRect();
        // Adjust particle origin for textarea - this is an approximation.
        // Precise caret position is complex to get for dynamic effects.
        const startX = textareaRect ? textareaRect.left + (textareaRect.width / 2) + window.scrollX - 10 : window.innerWidth / 2;
        const startY = textareaRect ? textareaRect.top + window.scrollY + 10 : window.innerHeight / 2; // Start a bit lower for textarea

        let particleStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${startX + Math.random() * 20 - 10}px`,
            top: `${startY + Math.random() * 20 - 10}px`,
            opacity: 1,
        };
        let particleType = selectedEffect;
        const color = getRandomColorFromPalette(selectedEffect);

        switch (selectedEffect) {
            case "particles":
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 3 + 2}px`,
                    height: `${Math.random() * 3 + 2}px`,
                    backgroundColor: color,
                    borderRadius: '50%',
                    animation: `particle-effect 0.6s ease-out forwards`,
                };
                break;
            case "fireworks":
                particleStyle = {
                    ...particleStyle,
                    width: '2px',
                    height: `${Math.random() * 8 + 7}px`,
                    backgroundColor: color,
                    animation: `firework-particle-effect 0.8s ease-out forwards`,
                };
                break;
            case "flames":
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
                particleStyle = {
                    ...particleStyle,
                    width: '1px',
                    height: `${Math.random() * 20 + 15}px`,
                    backgroundColor: color,
                    animation: `rift-effect 0.5s ease-in-out forwards`,
                    transform: `rotate(${Math.random() * 180 - 90}deg)`,
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

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => { // Changed event type
        setInputValue(event.target.value);
        if (selectedEffect !== "none") {
            const numParticles = selectedEffect === "fireworks" ? 5 : (selectedEffect === "flames" ? 2 : (selectedEffect === "rift" ? 1 : 3));
            const newParticles = Array.from({ length: numParticles })
                .map(() => createParticle())
                .filter(p => p !== null) as Particle[];

            setAnimations(prev => [...prev, ...newParticles]);

            newParticles.forEach(p => {
                let duration = 700;
                if (p.type === "fireworks") duration = 800;
                if (p.type === "flames") duration = 700;
                if (p.type === "particles") duration = 600;
                if (p.type === "magic") duration = 700;
                if (p.type === "rift") duration = 500;

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
                @keyframes particle-effect {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(${Math.random() * 80 - 40}px, ${Math.random() * -80 - 20}px) scale(0);
                        opacity: 0;
                    }
                }
                @keyframes firework-particle-effect {
                    0% {
                        transform: translateY(0) scaleY(1) scaleX(1) rotate(0deg);
                        opacity: 1;
                    }
                    20% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-120px) scaleY(0.5) scaleX(0.2) rotate(${Math.random() * 90 - 45}deg);
                        opacity: 0;
                    }
                }
                @keyframes flame-effect {
                    0% {
                        transform: translateY(0) scale(1) skewX(0deg);
                        opacity: 0.8;
                    }
                    50% {
                        transform: translateY(-30px) scale(1.2, 0.8) skewX(${Math.random() * 20 - 10}deg);
                        opacity: 0.5;
                    }
                    100% {
                        transform: translateY(-70px) scale(0.5, 0.2) skewX(${Math.random() * 40 - 20}deg);
                        opacity: 0;
                    }
                }
                @keyframes magic-effect {
                    0% {
                        transform: scale(0.5) rotate(0deg);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2) rotate(${Math.random() * 360}deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(0.5) rotate(${Math.random() * 360 + 360}deg);
                        opacity: 0;
                    }
                }
                @keyframes rift-effect {
                    0% {
                        transform: scaleX(0.1) rotate(${Math.random() * 180 - 90}deg);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scaleX(1) rotate(${Math.random() * 180 - 90}deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scaleX(0.1) rotate(${Math.random() * 180 - 90}deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}