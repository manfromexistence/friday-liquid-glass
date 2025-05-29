"use client"
import { Cog } from "lucide-react";
import Script from "next/script";
import { useState, useEffect, useCallback } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"; // Assuming this is your path
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // Assuming this is your path
import { Slider } from "@/components/ui/slider"; // Assuming this is your path
import { Switch } from "@/components/ui/switch"; // Assuming this is your path
import { Button } from "@/components/ui/button"; // Assuming this is your path
import { Separator } from "@/components/ui/separator"; // Assuming this is your path
import { Input } from "@/components/ui/input"; // Assuming this is your path

// Define the structure of the fluid config object based on fluid.js
interface FluidConfig {
    SIM_RESOLUTION: number;
    DYE_RESOLUTION: number;
    CAPTURE_RESOLUTION: number;
    DENSITY_DISSIPATION: number;
    VELOCITY_DISSIPATION: number;
    PRESSURE: number;
    PRESSURE_ITERATIONS: number;
    CURL: number;
    SPLAT_RADIUS: number;
    SPLAT_FORCE: number;
    SHADING: boolean;
    COLORFUL: boolean;
    COLOR_UPDATE_SPEED: number;
    PAUSED: boolean;
    BACK_COLOR: { r: number; g: number; b: number };
    TRANSPARENT: boolean;
    BLOOM: boolean;
    BLOOM_ITERATIONS: number;
    BLOOM_RESOLUTION: number;
    BLOOM_INTENSITY: number;
    BLOOM_THRESHOLD: number;
    BLOOM_SOFT_KNEE: number;
    SUNRAYS: boolean;
    SUNRAYS_RESOLUTION: number;
    SUNRAYS_WEIGHT: number;
    // Add any other properties from the config object in fluid.js
}

// Extend window type to include fluidInterop
declare global {
    interface Window {
        fluidInterop?: {
            getConfig: () => FluidConfig;
            setConfigValue: (key: keyof FluidConfig, value: any) => void;
            triggerAction: (actionName: string) => void;
        };
        initFramebuffers?: () => void;
        updateKeywords?: () => void;
    }
}

const initialConfig: FluidConfig = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 1,
    VELOCITY_DISSIPATION: 0.2,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 30,
    SPLAT_RADIUS: 0.25,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLORFUL: true,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: false,
    BLOOM: true,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: true,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 1.0,
};


export default function Fluid() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [fluidConfig, setFluidConfig] = useState<FluidConfig | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (window.fluidInterop) {
            setFluidConfig(window.fluidInterop.getConfig());
        } else {
            // Fallback or retry mechanism if fluidInterop is not immediately available
            const intervalId = setInterval(() => {
                if (window.fluidInterop) {
                    setFluidConfig(window.fluidInterop.getConfig());
                    clearInterval(intervalId);
                }
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, []);

    const handleConfigChange = useCallback(<K extends keyof FluidConfig>(key: K, value: FluidConfig[K]) => {
        if (window.fluidInterop && fluidConfig) {
            window.fluidInterop.setConfigValue(key, value);
            setFluidConfig(prevConfig => prevConfig ? { ...prevConfig, [key]: value } : null);
        }
    }, [fluidConfig]);

    const handleColorChannelChange = useCallback((channel: 'r' | 'g' | 'b', value: string) => {
        if (fluidConfig && fluidConfig.BACK_COLOR) {
            const numericValue = parseInt(value, 10);
            if (!isNaN(numericValue)) {
                const newColor = { ...fluidConfig.BACK_COLOR, [channel]: Math.max(0, Math.min(255, numericValue)) };
                handleConfigChange('BACK_COLOR', newColor);
            }
        }
    }, [fluidConfig, handleConfigChange]);


    const triggerFluidAction = (actionName: string) => {
        if (window.fluidInterop) {
            window.fluidInterop.triggerAction(actionName);
        }
    };

    if (!isClient || !fluidConfig) {
        // Render loading state or placeholder if not on client or config not loaded
        return (
            <div className="relative h-full w-full">
                <Script id="show-fluids" strategy="lazyOnload">
                    {`
                      // GA script might need adjustment if it depends on fluid.js internals
                      // For now, keeping it as is.
                      window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
                      ga('create', 'UA-105392568-1', 'auto');
                      ga('send', 'pageview');`
                    }
                </Script>
                <Script src="/fluid.js" strategy="lazyOnload" onLoad={() => {
                    if (window.fluidInterop) {
                        setFluidConfig(window.fluidInterop.getConfig());
                    }
                }} />
                <canvas className="h-full w-full rounded-md"></canvas>
                 <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border hover:bg-primary-foreground">
                    <Cog className="h-4 w-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <Script id="show-fluids" strategy="lazyOnload">
                {`
                  window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
                  ga('create', 'UA-105392568-1', 'auto');
                  ga('send', 'pageview');`
                }
            </Script>
            <Script src="/fluid.js" strategy="lazyOnload" onLoad={() => {
                 if (window.fluidInterop && !fluidConfig) { // Initialize if not already set
                    setFluidConfig(window.fluidInterop.getConfig());
                }
            }}/>
            <canvas className="h-full w-full rounded-md"></canvas>

            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                    <div className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border hover:bg-primary-foreground">
                        <Cog className="h-4 w-4" />
                    </div>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Fluid Simulation Settings</SheetTitle>
                        <SheetDescription>
                            Adjust the parameters of the fluid simulation. Changes are applied live.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-6 py-6">
                        {/* Quality (DYE_RESOLUTION) */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="quality" className="col-span-1">Quality</Label>
                            <Select
                                value={String(fluidConfig.DYE_RESOLUTION)}
                                onValueChange={(value) => handleConfigChange('DYE_RESOLUTION', parseInt(value))}
                            >
                                <SelectTrigger className="col-span-2">
                                    <SelectValue placeholder="Select quality" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1024">High (1024)</SelectItem>
                                    <SelectItem value="512">Medium (512)</SelectItem>
                                    <SelectItem value="256">Low (256)</SelectItem>
                                    <SelectItem value="128">Very Low (128)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sim Resolution (SIM_RESOLUTION) */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="simResolution" className="col-span-1">Sim Resolution</Label>
                            <Select
                                value={String(fluidConfig.SIM_RESOLUTION)}
                                onValueChange={(value) => handleConfigChange('SIM_RESOLUTION', parseInt(value))}
                            >
                                <SelectTrigger className="col-span-2">
                                    <SelectValue placeholder="Select sim resolution" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="256">256</SelectItem>
                                    <SelectItem value="128">128</SelectItem>
                                    <SelectItem value="64">64</SelectItem>
                                    <SelectItem value="32">32</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Density Dissipation */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="densityDissipation" className="col-span-1">Density Diffusion</Label>
                            <Slider
                                id="densityDissipation"
                                min={0} max={4} step={0.1}
                                value={[fluidConfig.DENSITY_DISSIPATION]}
                                onValueChange={([value]) => handleConfigChange('DENSITY_DISSIPATION', value)}
                                className="col-span-2"
                            />
                        </div>
                        
                        {/* Velocity Dissipation */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="velocityDissipation" className="col-span-1">Velocity Diffusion</Label>
                            <Slider
                                id="velocityDissipation"
                                min={0} max={4} step={0.1}
                                value={[fluidConfig.VELOCITY_DISSIPATION]}
                                onValueChange={([value]) => handleConfigChange('VELOCITY_DISSIPATION', value)}
                                className="col-span-2"
                            />
                        </div>

                        {/* Pressure */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="pressure" className="col-span-1">Pressure</Label>
                            <Slider
                                id="pressure"
                                min={0} max={1} step={0.01}
                                value={[fluidConfig.PRESSURE]}
                                onValueChange={([value]) => handleConfigChange('PRESSURE', value)}
                                className="col-span-2"
                            />
                        </div>

                        {/* Vorticity (CURL) */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="vorticity" className="col-span-1">Vorticity</Label>
                            <Slider
                                id="vorticity"
                                min={0} max={50} step={1}
                                value={[fluidConfig.CURL]}
                                onValueChange={([value]) => handleConfigChange('CURL', value)}
                                className="col-span-2"
                            />
                        </div>

                        {/* Splat Radius */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="splatRadius" className="col-span-1">Splat Radius</Label>
                            <Slider
                                id="splatRadius"
                                min={0.01} max={1} step={0.01}
                                value={[fluidConfig.SPLAT_RADIUS]}
                                onValueChange={([value]) => handleConfigChange('SPLAT_RADIUS', value)}
                                className="col-span-2"
                            />
                        </div>
                        
                        <Separator />

                        {/* Shading */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="shading">Shading</Label>
                            <Switch
                                id="shading"
                                checked={fluidConfig.SHADING}
                                onCheckedChange={(checked) => handleConfigChange('SHADING', checked)}
                            />
                        </div>

                        {/* Colorful */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="colorful">Colorful</Label>
                            <Switch
                                id="colorful"
                                checked={fluidConfig.COLORFUL}
                                onCheckedChange={(checked) => handleConfigChange('COLORFUL', checked)}
                            />
                        </div>

                        {/* Paused */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="paused">Paused</Label>
                            <Switch
                                id="paused"
                                checked={fluidConfig.PAUSED}
                                onCheckedChange={(checked) => handleConfigChange('PAUSED', checked)}
                            />
                        </div>
                        
                        <Button variant="outline" onClick={() => triggerFluidAction('randomSplat')}>Random Splats</Button>

                        <Separator />
                        <Label className="text-lg font-semibold">Bloom</Label>

                        {/* Bloom Enabled */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="bloomEnabled">Enabled</Label>
                            <Switch
                                id="bloomEnabled"
                                checked={fluidConfig.BLOOM}
                                onCheckedChange={(checked) => handleConfigChange('BLOOM', checked)}
                            />
                        </div>
                        {/* Bloom Intensity */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="bloomIntensity" className="col-span-1">Intensity</Label>
                            <Slider
                                id="bloomIntensity"
                                min={0.1} max={2.0} step={0.1}
                                value={[fluidConfig.BLOOM_INTENSITY]}
                                onValueChange={([value]) => handleConfigChange('BLOOM_INTENSITY', value)}
                                className="col-span-2"
                                disabled={!fluidConfig.BLOOM}
                            />
                        </div>
                        {/* Bloom Threshold */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="bloomThreshold" className="col-span-1">Threshold</Label>
                            <Slider
                                id="bloomThreshold"
                                min={0.0} max={1.0} step={0.01}
                                value={[fluidConfig.BLOOM_THRESHOLD]}
                                onValueChange={([value]) => handleConfigChange('BLOOM_THRESHOLD', value)}
                                className="col-span-2"
                                disabled={!fluidConfig.BLOOM}
                            />
                        </div>

                        <Separator />
                        <Label className="text-lg font-semibold">Sunrays</Label>
                        {/* Sunrays Enabled */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sunraysEnabled">Enabled</Label>
                            <Switch
                                id="sunraysEnabled"
                                checked={fluidConfig.SUNRAYS}
                                onCheckedChange={(checked) => handleConfigChange('SUNRAYS', checked)}
                            />
                        </div>
                        {/* Sunrays Weight */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="sunraysWeight" className="col-span-1">Weight</Label>
                            <Slider
                                id="sunraysWeight"
                                min={0.3} max={1.0} step={0.01}
                                value={[fluidConfig.SUNRAYS_WEIGHT]}
                                onValueChange={([value]) => handleConfigChange('SUNRAYS_WEIGHT', value)}
                                className="col-span-2"
                                disabled={!fluidConfig.SUNRAYS}
                            />
                        </div>
                        
                        <Separator />
                        <Label className="text-lg font-semibold">Capture</Label>
                        {/* Background Color */}
                        <div className="grid grid-cols-1 gap-2">
                            <Label>Background Color (R, G, B)</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Input
                                    type="number"
                                    min="0" max="255"
                                    value={fluidConfig.BACK_COLOR.r}
                                    onChange={(e) => handleColorChannelChange('r', e.target.value)}
                                    placeholder="R"
                                />
                                <Input
                                    type="number"
                                    min="0" max="255"
                                    value={fluidConfig.BACK_COLOR.g}
                                    onChange={(e) => handleColorChannelChange('g', e.target.value)}
                                    placeholder="G"
                                />
                                <Input
                                    type="number"
                                    min="0" max="255"
                                    value={fluidConfig.BACK_COLOR.b}
                                    onChange={(e) => handleColorChannelChange('b', e.target.value)}
                                    placeholder="B"
                                />
                            </div>
                        </div>

                        {/* Transparent Background */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="transparentBg">Transparent Background</Label>
                            <Switch
                                id="transparentBg"
                                checked={fluidConfig.TRANSPARENT}
                                onCheckedChange={(checked) => handleConfigChange('TRANSPARENT', checked)}
                            />
                        </div>
                        <Button variant="outline" onClick={() => triggerFluidAction('captureScreenshot')}>Take Screenshot</Button>

                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="button">Close</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
