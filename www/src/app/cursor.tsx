"use client";

import React, { useState, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    atomExplosion1,
    atomExplosion2,
    atomExplosion3,
    atomExplosion4,
    atomExplosion5,
    atomExplosion6,
    atomExplosion7,
    atomExplosion8,
    atomExplosion9,
    atomExplosion10,
    magic,
    verticalRift,
    horizontalRift,
    space1,
    space2,
    flame,
    sparkles,
    threeColorfulFireworks,
    threeColorfulFireworks2,
    clippy
} from "./data";

const effectOptions = [
    { value: "none", label: "None" },
    { value: "atom_explosion", label: "Atom Explosion (GIF)" },
    { value: "magic_gif", label: "Magic (GIF)" },
    { value: "vertical_rift", label: "Vertical Rift (GIF)" },
    { value: "horizontal_rift", label: "Horizontal Rift (GIF)" },
    { value: "space_effect", label: "Space (GIF)" },
    { value: "flame_gif", label: "Flame (GIF)" },
    { value: "sparkles_gif", label: "Sparkles (GIF)" },
    { value: "fireworks_colorful_gif", label: "Colorful Fireworks (GIF)" },
    { value: "clippy_gif", label: "Clippy (GIF)" },
];

interface Particle {
    id: number;
    x: number;
    y: number;
    style: React.CSSProperties;
    type: string;
}

export function Cursor() {
    const [inputValue, setInputValue] = useState("");
    const [selectedEffect, setSelectedEffect] = useState("none");
    const [animations, setAnimations] = useState<Particle[]>([]);
    const animationIdCounter = useRef(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastKeypressTime = useRef<number>(0);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    const calculateCursorPosition = () => {
        if (textareaRef.current) {
            const { selectionStart } = textareaRef.current;
            const textareaRect = textareaRef.current.getBoundingClientRect();
            const style = getComputedStyle(textareaRef.current);
            const paddingTop = parseFloat(style.paddingTop);
            const paddingLeft = parseFloat(style.paddingLeft);
            const borderTopWidth = parseFloat(style.borderTopWidth);
            const borderLeftWidth = parseFloat(style.borderLeftWidth);
            const lineHeight = parseFloat(style.lineHeight) || 20;

            const row = Math.floor(selectionStart / Math.floor(textareaRef.current.cols));
            const col = selectionStart % Math.floor(textareaRef.current.cols);

            const cursorX = textareaRect.left + borderLeftWidth + paddingLeft + col * 10;
            const cursorY = textareaRect.top + borderTopWidth + paddingTop + row * lineHeight;

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

        switch (selectedEffect) {
            case "atom_explosion":
                const atomExplosions = [atomExplosion1, atomExplosion2, atomExplosion3, atomExplosion4, atomExplosion5, atomExplosion6, atomExplosion7, atomExplosion8, atomExplosion9, atomExplosion10];
                const randomAtomExplosion = atomExplosions[Math.floor(Math.random() * atomExplosions.length)];
                particleStyle = {
                    ...particleStyle,
                    width: "50px",
                    height: "50px",
                    backgroundImage: `url("${randomAtomExplosion}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                };
                particleType = "atom_explosion";
                break;
            case "magic_gif":
                particleStyle = {
                    ...particleStyle,
                    width: "60px",
                    height: "60px",
                    backgroundImage: `url("${magic}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                };
                particleType = "magic_gif";
                break;
            case "vertical_rift":
                particleStyle = {
                    ...particleStyle,
                    width: "30px",
                    height: "100px",
                    backgroundImage: `url("${verticalRift}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                };
                particleType = "vertical_rift";
                break;
            case "horizontal_rift":
                particleStyle = {
                    ...particleStyle,
                    width: "100px",
                    height: "30px",
                    backgroundImage: `url("${horizontalRift}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                };
                particleType = "horizontal_rift";
                break;
            case "space_effect":
                const spaceGifs = [space1, space2];
                const randomSpaceGif = spaceGifs[Math.floor(Math.random() * spaceGifs.length)];
                particleStyle = {
                    ...particleStyle,
                    width: "70px",
                    height: "70px",
                    backgroundImage: `url("${randomSpaceGif}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                };
                particleType = "space_effect";
                break;
            case "flame_gif":
                particleStyle = {
                    ...particleStyle,
                    width: "50px",
                    height: "70px",
                    backgroundImage: `url("${flame}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                };
                particleType = "flame_gif";
                break;
            case "sparkles_gif":
                particleStyle = {
                    ...particleStyle,
                    width: "80px",
                    height: "80px",
                    backgroundImage: `url("${sparkles}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                };
                particleType = "sparkles_gif";
                break;
            case "fireworks_colorful_gif":
                const fireworksGifs = [threeColorfulFireworks, threeColorfulFireworks2];
                const randomFireworksGif = fireworksGifs[Math.floor(Math.random() * fireworksGifs.length)];
                particleStyle = {
                    ...particleStyle,
                    width: "100px",
                    height: "100px",
                    backgroundImage: `url("${randomFireworksGif}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                };
                particleType = "fireworks_colorful_gif";
                break;
            case "clippy_gif":
                particleStyle = {
                    ...particleStyle,
                    width: "80px",
                    height: "80px",
                    backgroundImage: `url("${clippy}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                };
                particleType = "clippy_gif";
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

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (selectedEffect === "none") return;

        // Only process printable characters
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
            const currentTime = Date.now();
            const { x, y } = calculateCursorPosition();

            if (currentTime - lastKeypressTime.current > 500 || animations.length === 0) {
                // Create a new particle if enough time has passed or no particles exist
                const newParticle = createParticle(x, y);
                if (newParticle) {
                    setAnimations([newParticle]); // Replace any existing particles
                    // Remove the particle after 1 second
                    setTimeout(() => {
                        setAnimations(prev => prev.filter(p => p.id !== newParticle.id));
                    }, 1000);
                }
            } else {
                // Update the position of the existing particle
                setAnimations(prev =>
                    prev.map(p => ({
                        ...p,
                        x,
                        y,
                        style: { ...p.style, left: `${x}px`, top: `${y}px` },
                    }))
                );
            }

            lastKeypressTime.current = currentTime;

            // Reset the timeout to extend particle lifetime during rapid typing
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }
            typingTimeout.current = setTimeout(() => {
                setAnimations([]);
            }, 1000);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(event.target.value);
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
                onKeyDown={handleKeyDown}
                placeholder="Type here to unleash the power..."
                className="w-full max-w-md bg-background text-sm border text-foreground placeholder:text-muted-foreground p-3 rounded-md shadow-lg focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                minRows={3}
            />

            {/* Animation container */}
            <div id="animation-container" className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]">
                {animations.map(anim => (
                    <div key={anim.id} style={anim.style} />
                ))}
            </div>
        </div>
    );
}