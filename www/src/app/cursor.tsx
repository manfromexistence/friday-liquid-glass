"use client";

import React, { useState, ChangeEvent, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
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

const effectColorPalettes: Record<string, string[]> = {
    particles: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
    fireworks: ["#FFD700", "#FFA500", "#FF4500", "#FF69B4", "#ADD8E6", "#FFFFFF"],
    flames: ["#FF4500", "#FFA500", "#FFD700", "#DC143C"],
    magic: ["#8A2BE2", "#4B0082", "#9400D3", "#00FA9A", "#AFEEEE"],
    rift: ["#483D8B", "#000080", "#E0FFFF", "#FF00FF"]
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
        if (!palette || palette.length === 0) return "hsl(var(--primary))";
        return palette[Math.floor(Math.random() * palette.length)];
    };

    const calculateCursorPosition = () => {
        if (textareaRef.current) {
            const { selectionStart } = textareaRef.current;
            const textareaRect = textareaRef.current.getBoundingClientRect();
            const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight, 10) || 20;

            const row = Math.floor(selectionStart / Math.floor(textareaRef.current.cols));
            const col = selectionStart % Math.floor(textareaRef.current.cols);

            // Calculate cursor position based on column and row
            const cursorX = textareaRect.left + col * 10 + 5; // Adjust as needed
            const cursorY = textareaRect.top + row * lineHeight + 5; // Adjust as needed

            return { x: cursorX, y: cursorY };
        }
        return { x: 0, y: 0 };
    };

    const createParticle = (cursorX: number, cursorY: number): Particle | null => {
        const newParticleId = animationIdCounter.current++;
        
        let particleStyle: React.CSSProperties = {
            position: "absolute",
            left: `${cursorX}px`,
            top: `${cursorY}px`,
            opacity: 1,
        };
        let particleType = selectedEffect;
        let color = getRandomColorFromPalette(selectedEffect);

        switch (selectedEffect) {
            case "particles":
                color = getRandomColorFromPalette("particles");
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 10 + 5}px`, // Increased size for particles
                    height: `${Math.random() * 10 + 5}px`, // Increased size for particles
                    backgroundColor: color,
                    borderRadius: "50%",
                    animation: `particle-effect 1s ease-out forwards`,
                };
                break;
            case "fireworks":
                color = getRandomColorFromPalette("fireworks");
                particleStyle = {
                    ...particleStyle,
                    width: "4px",
                    height: `${Math.random() * 12 + 10}px`,
                    backgroundColor: color,
                    animation: `firework-particle-effect 0.8s ease-out forwards`,
                };
                break;
            case "flames":
                color = getRandomColorFromPalette("flames");
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 10 + 10}px`,
                    height: `${Math.random() * 20 + 15}px`,
                    backgroundColor: color,
                    borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%",
                    transformOrigin: "bottom center",
                    animation: `flame-effect 0.7s ease-out forwards`,
                };
                break;
            case "magic":
                const magicColor = getRandomColorFromPalette("magic");
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 8 + 5}px`,
                    height: `${Math.random() * 8 + 5}px`,
                    backgroundColor: magicColor,
                    boxShadow: `0 0 5px ${magicColor}, 0 0 10px ${magicColor}`,
                    borderRadius: "50%",
                    animation: `magic-effect 0.7s ease-out forwards`,
                };
                particleType = "magic";
                break;
            case "rift":
                color = getRandomColorFromPalette("rift");
                particleStyle = {
                    ...particleStyle,
                    width: "2px",
                    height: `${Math.random() * 30 + 20}px`,
                    backgroundColor: color,
                    animation: `rift-effect 0.5s ease-in-out forwards`,
                    transform: `rotate(${Math.random() * 90 - 45}deg)`,
                };
                particleType = "rift";
                break;
            default:
                return null;
        }

        return {
            id: newParticleId,
            x: cursorX,
            y: cursorY,
            style: particleStyle,
            type: particleType,
        };
    };

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(event.target.value);
    };

    const handleSelect = () => {
        const { x, y } = calculateCursorPosition();
        const newParticles = createParticle(x, y);
        if (newParticles) {
            setAnimations(prev => [...prev, newParticles]);
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

            <TextareaAutosize
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onSelect={handleSelect}
                placeholder="Type here to unleash the power..."
                className="w-full max-w-md bg-input border-border text-foreground placeholder:text-muted-foreground text-lg p-3 rounded-md shadow-lg focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                minRows={3}
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
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-70px) scale(0);
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
                        transform: translateY(-100px) scale(0.3);
                        opacity: 0;
                    }
                }
                @keyframes flame-effect {
                    0% {
                        transform: translateY(0) scaleY(1) scaleX(1) skewX(0deg);
                        opacity: 0.8;
                    }
                    50% {
                        transform: translateY(-35px) scaleY(1.3) scaleX(0.7) skewX(-8deg);
                        opacity: 0.5;
                    }
                    100% {
                        transform: translateY(-80px) scaleY(0.4) scaleX(0.2) skewX(8deg);
                        opacity: 0;
                    }
                }
                @keyframes magic-effect {
                    0% {
                        transform: scale(0.3) rotate(0deg);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2) rotate(180deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(0.3) rotate(360deg);
                        opacity: 0;
                    }
                }
                @keyframes rift-effect {
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
