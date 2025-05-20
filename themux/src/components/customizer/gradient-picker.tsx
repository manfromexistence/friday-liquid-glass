"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Palette, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PREDEFINED_GRADIENTS, Gradient } from "@/lib/gradient-palettes";
import { TAILWIND_PALETTE_V4 } from "@/lib/palettes";

interface GradientPickerProps {
    value: string; // Can be an ID of a predefined gradient or a custom CSS string
    onValueChange: (value: string) => void;
}

export function GradientPicker({ value, onValueChange }: GradientPickerProps) {
    const [open, setOpen] = React.useState(false);
    const selectedGradientData = PREDEFINED_GRADIENTS.find(
        (gradient) => gradient.id === value
    );

    let displayValue = "Select gradient...";
    let currentGradientCss: string | undefined = undefined;

    if (selectedGradientData) {
        displayValue = selectedGradientData.name;
        currentGradientCss = selectedGradientData.css;
    } else if (value && (value.startsWith("linear-gradient") || value.startsWith("radial-gradient") || value.startsWith("conic-gradient"))) {
        displayValue = "Custom Gradient";
        currentGradientCss = value;
    }

    const [customColors, setCustomColors] = React.useState<string[]>([]);
    const [gradientType, setGradientType] = React.useState<"linear" | "radial" | "mesh">("linear");
    const [gradientAngle, setGradientAngle] = React.useState<number>(90);

    const handlePredefinedSelect = (gradientId: string) => {
        onValueChange(gradientId); // Store by ID for predefined
        setOpen(false);
    };

    const handleApplyCustomGradient = () => {
        if (customColors.length > 0) {
            let css = "";
            if (customColors.length === 1) {
                css = `linear-gradient(${gradientAngle}deg, ${customColors[0]}, ${customColors[0]})`; // Or just customColors[0] for solid
            } else {
                 // Default to linear gradient with selected colors
                css = `linear-gradient(${gradientAngle}deg, ${customColors.join(', ')})`;
            }
            // TODO: Implement logic for radial and mesh based on gradientType
            onValueChange(css);
        }
        setOpen(false);
    };

    const toggleCustomColor = (colorValue: string) => {
        setCustomColors(prev =>
            prev.includes(colorValue)
                ? prev.filter(c => c !== colorValue)
                : (prev.length < 2 ? [...prev, colorValue] : [prev[prev.length -1 ], colorValue]) // Keep last, add new, max 2
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between"
                >
                    <span className="truncate flex items-center">
                        {currentGradientCss && (
                            <span
                                className="mr-2 inline-block h-4 w-4 rounded border"
                                style={{ background: currentGradientCss }}
                            />
                        )}
                        {displayValue}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0">
                <Tabs defaultValue="predefined" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="predefined">
                            <Palette className="mr-2 h-4 w-4" /> Predefined
                        </TabsTrigger>
                        <TabsTrigger value="custom">
                            <SlidersHorizontal className="mr-2 h-4 w-4" /> Custom
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="predefined" className="p-1 max-h-[300px] overflow-y-auto">
                        <Command>
                            <CommandInput placeholder="Search gradient..." />
                            <CommandList>
                                <CommandEmpty>No gradient found.</CommandEmpty>
                                <CommandGroup>
                                    {PREDEFINED_GRADIENTS.map((gradient) => (
                                        <CommandItem
                                            key={gradient.id}
                                            value={gradient.id} 
                                            onSelect={() => {
                                                handlePredefinedSelect(gradient.id);
                                            }}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className="w-4 h-4 mr-2 rounded border"
                                                    style={{ background: gradient.css }}
                                                />
                                                {gradient.name}
                                            </div>
                                            {value === gradient.id && (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </TabsContent>
                    <TabsContent value="custom" className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                        <div>
                            <h4 className="mb-2 text-sm font-medium">Colors (Select up to 2)</h4>
                            <div className="grid grid-cols-8 gap-1 mb-2"> {/* Adjusted grid columns for more colors */} 
                                {Object.entries(TAILWIND_PALETTE_V4).flatMap(([colorName, shades]) =>
                                    Object.entries(shades).map(([shade, oklchValue]) => (
                                        <Button
                                            key={`${colorName}-${shade}`}
                                            variant="outline"
                                            size="icon"
                                            className={cn("h-6 w-6 border rounded-full", customColors.includes(oklchValue) && "ring-2 ring-ring ring-offset-2")}
                                            style={{ backgroundColor: oklchValue }}
                                            onClick={() => toggleCustomColor(oklchValue)}
                                            title={`${colorName}-${shade}`}
                                        />
                                    ))
                                )}
                            </div>
                            <div className="flex items-center space-x-2 mb-2 h-8">
                                <span className="text-sm text-muted-foreground">Selected:</span>
                                {customColors.map((color, index) => (
                                    <div key={index} className="h-6 w-10 rounded border" style={{background: color}}></div>
                                ))}
                                {customColors.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Select 1 or 2 colors. The first color is the start, the second is the end.</p>
                        </div>

                        <div>
                            <h4 className="mb-2 text-sm font-medium">Gradient Type</h4>
                            <div className="flex space-x-2">
                                <Button variant={gradientType === 'linear' ? 'secondary' : 'outline'} onClick={() => setGradientType('linear')}>Linear</Button>
                                <Button variant={gradientType === 'radial' ? 'secondary' : 'outline'} onClick={() => setGradientType('radial')} disabled>Radial</Button>
                                <Button variant={gradientType === 'mesh' ? 'secondary' : 'outline'} onClick={() => setGradientType('mesh')} disabled>Mesh</Button>
                            </div>
                        </div>

                        {gradientType === 'linear' && (
                            <div>
                                <h4 className="mb-2 text-sm font-medium">Angle</h4>
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

                        <Button onClick={handleApplyCustomGradient} className="w-full" disabled={customColors.length === 0}>
                            Apply Custom Gradient
                        </Button>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}
