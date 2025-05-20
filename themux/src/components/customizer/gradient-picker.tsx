"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, XCircle, Minus, CircleDot } from "lucide-react"; // Updated imports

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
// Tabs removed
import { TAILWIND_PALETTE_V4 } from "@/lib/palettes";
import { PREDEFINED_GRADIENTS } from "@/lib/gradient-palettes";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GradientPickerProps {
    value: string; 
    onValueChange: (value: string) => void;
}

interface ColorStop {
    id: string; // Unique ID for React key
    color: string; // OKLCH color string
    // position?: number; // Optional: for more precise control (0-100)
}

export function GradientPicker({ value, onValueChange }: GradientPickerProps) {
    const [open, setOpen] = React.useState(false);
    // activeTab state removed

    // Determine display value for the trigger button
    const selectedPredefined = PREDEFINED_GRADIENTS.find(g => g.id === value);
    let displayValue = "Custom Gradient";
    let currentGradientCss: string | undefined = value; // Assume value is CSS if not a predefined ID

    if (selectedPredefined) {
        displayValue = selectedPredefined.name;
        currentGradientCss = selectedPredefined.css;
    } else if (!value || (!value.startsWith("linear-gradient") && !value.startsWith("radial-gradient") && !value.startsWith("conic-gradient"))) {
        displayValue = "Select or Create Gradient";
        currentGradientCss = undefined; // No valid gradient selected or being built
    }

    // Custom gradient state
    const initialColorStops: ColorStop[] = [
        { id: `stop-${Date.now()}-1`, color: TAILWIND_PALETTE_V4.blue[500] }, 
        { id: `stop-${Date.now()}-2`, color: TAILWIND_PALETTE_V4.pink[500] },
    ];
    const [colorStops, setColorStops] = React.useState<ColorStop[]>(initialColorStops);
    const [gradientType, setGradientType] = React.useState<"linear" | "radial">("linear"); // Mesh removed for simplicity for now
    const [gradientAngle, setGradientAngle] = React.useState<number>(90);
    const [editingColorStopId, setEditingColorStopId] = React.useState<string | null>(null);

    // Generate CSS for the demo div and for applying
    const generateGradientCSS = React.useCallback(() => {
        if (colorStops.length === 0) return "transparent";
        if (colorStops.length === 1) return colorStops[0].color; // Solid color

        const colors = colorStops.map(stop => stop.color).join(", ");
        if (gradientType === "linear") {
            return `linear-gradient(${gradientAngle}deg, ${colors})`;
        }
        if (gradientType === "radial") {
            return `radial-gradient(circle, ${colors})`; // Basic radial gradient
        }
        return `linear-gradient(${gradientAngle}deg, ${colors})`; // Fallback, though should be covered
    }, [colorStops, gradientType, gradientAngle]);

    const livePreviewCss = generateGradientCSS();

    const handleApplyCustomGradient = () => {
        const css = generateGradientCSS();
        if (css !== "transparent" && css !== colorStops[0]?.color) { // ensure it's a gradient
             onValueChange(css);
        }
        setOpen(false);
    };

    const addColorStop = () => {
        if (colorStops.length < 5) { // Limit max color stops for simplicity
            const newStop: ColorStop = {
                id: `stop-${Date.now()}-${colorStops.length + 1}`,
                color: TAILWIND_PALETTE_V4.green[500] // Default new color
            };
            setColorStops(prev => [...prev, newStop]);
        }
    };

    const removeColorStop = (idToRemove: string) => {
        if (colorStops.length > 2) { // Keep at least two stops
            setColorStops(prev => prev.filter(stop => stop.id !== idToRemove));
        }
    };

    const updateColorStop = (idToUpdate: string, newColor: string) => {
        setColorStops(prev => prev.map(stop => stop.id === idToUpdate ? { ...stop, color: newColor } : stop));
        setEditingColorStopId(null); // Close palette popover after selection
    };

    // Effect to update custom gradient if already showing custom and colors change
    // This makes the main button preview update live for custom gradients
    React.useEffect(() => {
        if (!selectedPredefined && open) { // activeTab removed from condition
            // If a custom gradient is active (value is a CSS string) and picker is open,
            // update the main value for live preview on the trigger button
            const currentCustomCss = generateGradientCSS();
            if (value !== currentCustomCss && (currentCustomCss.startsWith("linear-gradient") || currentCustomCss.startsWith("radial-gradient"))) {
                 // To avoid infinite loop, only call if it's a valid gradient and different
                 // This part is tricky; might be better to just rely on the demo div for live preview
                 // and only update onValueChange on apply.
                 // For now, let's comment this out to prevent potential issues.
                // onValueChange(currentCustomCss);
            }
        }
    }, [colorStops, gradientAngle, gradientType, open, value, selectedPredefined, generateGradientCSS, onValueChange]);

    return (
        <Popover open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            // setActiveTab("custom") removed
            if (!isOpen) setEditingColorStopId(null); // Reset editing state when closing
        }}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                >
                    {/* <span className="truncate flex items-center">
                        {currentGradientCss && (
                            <span
                                className="mr-2 inline-block h-4 w-4 rounded border"
                                style={{ background: currentGradientCss }}
                            />
                        )}
                        {displayValue}
                    </span> */}
                    <ChevronsUpDown className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4 space-y-3"> {/* Removed p-0, added p-4 and space-y-3 directly */}
                {/* Tabs component removed */}
                {/* Content of former TabsContent value="custom" is now directly here */}
                {/* <div className="text-center mb-2">
                        <h3 className="text-lg font-medium">Create Custom Gradient</h3>
                </div> */}
                {/* Demo Div */}
                <div className="h-24 w-full rounded" style={{ background: livePreviewCss }} />

                <div>
                    <h4 className="mb-1 text-sm font-medium">Color Stops</h4>
                    <div className="space-y-2">
                        {colorStops.map((stop, index) => (
                            <div key={stop.id} className="flex items-center space-x-2">
                                <Popover open={editingColorStopId === stop.id} onOpenChange={(isPopoverOpen) => {
                                    if (!isPopoverOpen) setEditingColorStopId(null);
                                }}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0 border-2"
                                            style={{ backgroundColor: stop.color, borderColor: editingColorStopId === stop.id ? 'hsl(var(--primary))' : stop.color }}
                                            onClick={() => setEditingColorStopId(stop.id)}
                                            title="Edit color"
                                        />
                                    </PopoverTrigger>
                                    <PopoverContent className="p-1 w-[280px]">
                                        <ScrollArea className="h-[200px]">
                                        <div className="grid grid-cols-7 gap-1 p-1">
                                            {Object.entries(TAILWIND_PALETTE_V4).flatMap(([colorName, shades]) =>
                                                Object.entries(shades).map(([shade, oklchValue]) => (
                                                    <Button
                                                        key={`${colorName}-${shade}`}
                                                        variant="outline"
                                                        size="icon"
                                                        className={cn("h-7 w-7 border rounded-full", stop.color === oklchValue && "ring-2 ring-ring ring-offset-2")}
                                                        style={{ backgroundColor: oklchValue }}
                                                        onClick={() => updateColorStop(stop.id, oklchValue)}
                                                        title={`${colorName}-${shade}`}
                                                    />
                                                ))
                                            )}
                                        </div>
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                                <span className="text-xs text-muted-foreground">Color {index + 1}</span>
                                {colorStops.length > 2 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeColorStop(stop.id)} className="h-6 w-6 ml-auto">
                                        <XCircle className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    {colorStops.length < 5 && (
                        <Button variant="outline" size="sm" onClick={addColorStop} className="mt-2 w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Color Stop
                        </Button>
                    )}
                </div>

                <div>
                    <h4 className="mb-1 text-sm font-medium">Gradient Type</h4>
                    <div className="flex space-x-2">
                        <Button variant={gradientType === 'linear' ? 'secondary' : 'outline'} onClick={() => setGradientType('linear')} size="icon" title="Linear Gradient">
                            <Minus className="h-5 w-5" />
                        </Button>
                        <Button variant={gradientType === 'radial' ? 'secondary' : 'outline'} onClick={() => setGradientType('radial')} size="icon" title="Radial Gradient">
                            <CircleDot className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {gradientType === 'linear' && (
                    <div>
                        <h4 className="mb-1 text-sm font-medium">Angle</h4>
                        <div className="flex items-center space-x-2">
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={gradientAngle}
                                onChange={(e) => setGradientAngle(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <span className="text-sm w-10 text-right">{gradientAngle}°</span>
                        </div>
                    </div>
                )}
                {/* TODO: Add controls for Radial type (position, shape) */}

                <Button onClick={handleApplyCustomGradient} className="w-full mt-3">
                    Apply Gradient
                </Button>
                {/* End of former TabsContent */}
            </PopoverContent>
        </Popover>
    );
}
