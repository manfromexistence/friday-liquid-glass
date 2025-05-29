"use client";

import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Particle {
    id: number;
    x: number; // Retained for potential future use with more complex physics
    y: number; // Retained for potential future use with more complex physics
    style: React.CSSProperties;
    type: string; // To apply different keyframes
}

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
    const inputRef = useRef<HTMLInputElement>(null);

    const createParticle = (): Particle | null => {
        const newParticleId = animationIdCounter.current++;
        const inputRect = inputRef.current?.getBoundingClientRect();
        // Try to center the animation origin a bit better relative to the input
        const startX = inputRect ? inputRect.left + (inputRect.width / 2) + window.scrollX - 10 : window.innerWidth / 2;
        const startY = inputRect ? inputRect.top + window.scrollY - 20 : window.innerHeight / 2; // Adjusted for better visual placement

        let particleStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${startX + Math.random() * 20 - 10}px`, // Reduced spread for more focused origin
            top: `${startY + Math.random() * 20 - 10}px`,  // Reduced spread
            opacity: 1,
        };
        let particleType = selectedEffect;

        switch (selectedEffect) {
            case "particles":
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 3 + 2}px`, // smaller, more varied particles
                    height: `${Math.random() * 3 + 2}px`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
                    borderRadius: '50%',
                    animation: `particle-effect 0.6s ease-out forwards`,
                };
                break;
            case "fireworks":
                particleStyle = {
                    ...particleStyle,
                    width: '2px', // thinner
                    height: `${Math.random() * 8 + 7}px`, // longer, more varied streaks
                    backgroundColor: `hsl(${Math.random() * 60 + 200}, 100%, 60%)`, // Blues, Purples, Pinks for fireworks
                    animation: `firework-particle-effect 0.8s ease-out forwards`,
                };
                break;
            case "flames":
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 5 + 5}px`, // slightly wider base for flames
                    height: `${Math.random() * 10 + 10}px`, // taller flames
                    backgroundColor: `hsl(${Math.random() * 30 + 10}, 100%, 50%)`, // Reds, Oranges
                    borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%', // More flame-like shape
                    transformOrigin: 'bottom center',
                    animation: `flame-effect 0.7s ease-out forwards`,
                };
                break;
            case "magic":
                particleStyle = {
                    ...particleStyle,
                    width: `${Math.random() * 4 + 3}px`,
                    height: `${Math.random() * 4 + 3}px`,
                    backgroundColor: `hsl(${Math.random() * 60 + 270}, 100%, 70%)`, // Purples, Pinks, Blues
                    boxShadow: `0 0 5px hsl(${Math.random() * 60 + 270}, 100%, 70%), 0 0 10px hsl(${Math.random() * 60 + 270}, 100%, 70%)`,
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
                    backgroundColor: `hsl(${Math.random() * 30 + 180}, 70%, 60%)`, // Cyans, Teals
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

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        if (selectedEffect !== "none") {
            // Adjust particle count based on effect for better visual density
            const numParticles = selectedEffect === "fireworks" ? 5 : (selectedEffect === "flames" ? 2 : (selectedEffect === "rift" ? 1 : 3));
            const newParticles = Array.from({ length: numParticles })
                .map(() => createParticle())
                .filter(p => p !== null) as Particle[];

            setAnimations(prev => [...prev, ...newParticles]);

            newParticles.forEach(p => {
                let duration = 700; // default
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
        <div className="p-4 flex flex-col items-center space-y-4 min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold my-6">Power Input FX</h1>
            <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-xl">
                <Select onValueChange={setSelectedEffect} defaultValue="none">
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select an effect" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        {effectOptions.map(option => (
                            <SelectItem key={option.value} value={option.value} className="hover:bg-gray-600 focus:bg-gray-500">
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type here to unleash the power..."
                className="w-full max-w-md text-center bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-lg p-3 rounded-md shadow-lg focus:ring-2 focus:ring-purple-500"
            />

            {/* Animation container should be outside the normal flow and cover the screen */}
            <div id="animation-container" className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]">
                {animations.map(anim => (
                    <div key={anim.id} style={anim.style} />
                ))}
            </div>

            {/* Global styles for animations - more distinct effects */}
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