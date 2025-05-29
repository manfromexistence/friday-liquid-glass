"use client"

import { Cog, Palette, Zap, Camera, Settings2, ChevronsUpDown, RefreshCw, Droplets, Wind, Waves, Sun, Aperture } from "lucide-react";
import Script from "next/script";
import { useState, useEffect, useCallback } from "react";
import { parse, formatRgb, converter } from 'culori';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// LocalStorage keys (should match fluid.js)
const FLUID_CONFIG_KEY = 'fluidSimulationConfig';
const FLUID_ACTION_SPLAT_KEY = 'fluidActionSplat';
const FLUID_ACTION_SCREENSHOT_KEY = 'fluidActionScreenshot';

// Define the structure of the simulation config for type safety
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
}

// Default config for fluid.tsx if nothing in localStorage
const defaultFluidConfig: FluidConfig = {
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
    BLOOM: false,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: true,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 1.0,
};


export default function Fluids() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [simConfig, setSimConfig] = useState<Partial<FluidConfig>>({});
    const [isClient, setIsClient] = useState(false);

    const oklchToRgb = converter('rgb');

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getCssBackgroundAsRgb = useCallback(() => {
        if (typeof window !== 'undefined') {
            const bgOklch = getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim();
            if (bgOklch) {
                try {
                    const parsedColor = parse(bgOklch);
                    if (parsedColor) {
                        const rgbColor = oklchToRgb(parsedColor);
                        if (rgbColor) {
                            return { r: Math.round(rgbColor.r * 255), g: Math.round(rgbColor.g * 255), b: Math.round(rgbColor.b * 255) };
                        }
                    }
                } catch (error) {
                    console.error("Error parsing Oklch color:", error);
                    return { r: 0, g: 0, b: 0 };
                }
            }
        }
        return { r: 0, g: 0, b: 0 }; 
    }, [oklchToRgb]);

    // Effect to load config from localStorage and set up theme listener
    useEffect(() => {
        if (!isClient) return;

        let currentConfig: Partial<FluidConfig> = { ...defaultFluidConfig };
        try {
            const storedConfig = localStorage.getItem(FLUID_CONFIG_KEY);
            if (storedConfig) {
                currentConfig = { ...currentConfig, ...JSON.parse(storedConfig) };
            }
        } catch (e) {
            console.error("Failed to parse config from localStorage", e);
        }
        
        const backgroundColorRgb = getCssBackgroundAsRgb();
        const newConfig = {
            ...currentConfig,
            BACK_COLOR: backgroundColorRgb,
        };

        setSimConfig(newConfig);
        localStorage.setItem(FLUID_CONFIG_KEY, JSON.stringify(newConfig));


        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    const updatedBgColor = getCssBackgroundAsRgb();
                    setSimConfig(prev => {
                        if (prev.BACK_COLOR && prev.BACK_COLOR.r === updatedBgColor.r && prev.BACK_COLOR.g === updatedBgColor.g && prev.BACK_COLOR.b === updatedBgColor.b) {
                            return prev;
                        }
                        const updatedConfig = { ...prev, BACK_COLOR: updatedBgColor };
                        localStorage.setItem(FLUID_CONFIG_KEY, JSON.stringify(updatedConfig));
                        return updatedConfig;
                    });
                    break;
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true });

        // Listen for storage events to sync config if changed by another tab/source
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === FLUID_CONFIG_KEY && event.newValue) {
                try {
                    const updatedConfig = JSON.parse(event.newValue);
                    setSimConfig(prev => ({...prev, ...updatedConfig}));
                } catch (e) {
                    console.error("Error parsing stored config on storage event:", e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            observer.disconnect();
            window.removeEventListener('storage', handleStorageChange);
        };

    }, [isClient, getCssBackgroundAsRgb]);


    const handleConfigChange = useCallback(<K extends keyof FluidConfig>(key: K, value: FluidConfig[K]) => {
        if (!isClient) return;

        setSimConfig(prev => {
            const newConfig = { ...prev, [key]: value };
            localStorage.setItem(FLUID_CONFIG_KEY, JSON.stringify(newConfig));
            return newConfig;
        });
    }, [isClient]);

    const handleSliderChange = <K extends keyof FluidConfig>(key: K, value: number[]) => {
        handleConfigChange(key, value[0] as FluidConfig[K]);
    };

    const handleSwitchChange = <K extends keyof FluidConfig>(key: K, checked: boolean) => {
        handleConfigChange(key, checked as FluidConfig[K]);
    };

    const handleSelectChange = <K extends keyof FluidConfig>(key: K, value: string) => {
        handleConfigChange(key, parseInt(value, 10) as FluidConfig[K]);
    };

    const randomSplat = () => {
        if (isClient) {
            localStorage.setItem(FLUID_ACTION_SPLAT_KEY, 'true');
        }
    };

    const takeScreenshot = () => {
        if (isClient) {
            localStorage.setItem(FLUID_ACTION_SCREENSHOT_KEY, 'true');
        }
    };

    if (!isClient) {
        // Render a placeholder or nothing on the server
        return (
            <div className="relative h-full w-full">
                <Script id="show-fluids" strategy="lazyOnload">
                    {`
                      window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
                      ga('create', 'UA-105392568-1', 'auto');
                      ga('send', 'pageview');`
                    }
                </Script>
                <Script src="/fluid.js" strategy="lazyOnload" />
                <canvas className="h-full w-full rounded-md border"></canvas>
                <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border hover:bg-primary-foreground">
                    <Cog className="h-4 w-4 animate-spin" />
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
            <Script src="/fluid.js" strategy="lazyOnload" />
            <canvas className="h-full w-full rounded-md border"></canvas>
            <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="absolute right-2 top-2">
                        <Settings2 className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto scrollbar-thin mr-2">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Fluid Simulation Controls</h4>
                            <p className="text-sm text-muted-foreground">
                                Adjust the parameters of the fluid simulation.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            {Object.keys(simConfig).length > 0 ? ( // Check if simConfig is populated
                                <>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="sim-resolution">Sim Res</Label>
                                        <Select value={simConfig.SIM_RESOLUTION?.toString()} onValueChange={(val) => handleSelectChange("SIM_RESOLUTION", val)} >
                                            <SelectTrigger id="sim-resolution" className="col-span-2 h-8">
                                                <SelectValue placeholder="Select resolution" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[32, 64, 128, 256].map(res => <SelectItem key={res} value={res.toString()}>{res}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="dye-resolution">Dye Res</Label>
                                        <Select value={simConfig.DYE_RESOLUTION?.toString()} onValueChange={(val) => handleSelectChange("DYE_RESOLUTION", val)}>
                                            <SelectTrigger id="dye-resolution" className="col-span-2 h-8">
                                                <SelectValue placeholder="Select resolution" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[128, 256, 512, 1024].map(res => <SelectItem key={res} value={res.toString()}>{res}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <ControlSlider icon={<Droplets className="h-4 w-4 text-muted-foreground" />} label="Density Diff." value={simConfig.DENSITY_DISSIPATION} step={0.01} min={0} max={4} onChange={(val) => handleSliderChange("DENSITY_DISSIPATION", val)} />
                                    <ControlSlider icon={<Wind className="h-4 w-4 text-muted-foreground" />} label="Velocity Diff." value={simConfig.VELOCITY_DISSIPATION} step={0.01} min={0} max={4} onChange={(val) => handleSliderChange("VELOCITY_DISSIPATION", val)} />
                                    <ControlSlider icon={<Waves className="h-4 w-4 text-muted-foreground" />} label="Pressure" value={simConfig.PRESSURE} step={0.01} min={0} max={1} onChange={(val) => handleSliderChange("PRESSURE", val)} />
                                    <ControlSlider icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />} label="Vorticity" value={simConfig.CURL} step={1} min={0} max={50} onChange={(val) => handleSliderChange("CURL", val)} />
                                    <ControlSlider icon={<ChevronsUpDown className="h-4 w-4 text-muted-foreground" />} label="Splat Radius" value={simConfig.SPLAT_RADIUS} step={0.01} min={0.01} max={1} onChange={(val) => handleSliderChange("SPLAT_RADIUS", val)} />

                                    <ControlSwitch icon={<Palette className="h-4 w-4 text-muted-foreground" />} label="Shading" checked={simConfig.SHADING} onChange={(val) => handleSwitchChange("SHADING", val)} />
                                    <ControlSwitch icon={<Palette className="h-4 w-4 text-muted-foreground" />} label="Colorful" checked={simConfig.COLORFUL} onChange={(val) => handleSwitchChange("COLORFUL", val)} />
                                    <ControlSwitch icon={<Aperture className="h-4 w-4 text-muted-foreground" />} label="Bloom" checked={simConfig.BLOOM} onChange={(val) => handleSwitchChange("BLOOM", val)} />
                                    {simConfig.BLOOM && (
                                        <>
                                            <ControlSlider icon={<Settings2 className="h-4 w-4 text-muted-foreground" />} label="Bloom Intensity" value={simConfig.BLOOM_INTENSITY} step={0.1} min={0.1} max={2} onChange={(val) => handleSliderChange("BLOOM_INTENSITY", val)} />
                                            <ControlSlider icon={<Settings2 className="h-4 w-4 text-muted-foreground" />} label="Bloom Threshold" value={simConfig.BLOOM_THRESHOLD} step={0.01} min={0} max={1} onChange={(val) => handleSliderChange("BLOOM_THRESHOLD", val)} />
                                        </>
                                    )}
                                    <ControlSwitch icon={<Sun className="h-4 w-4 text-muted-foreground" />} label="Sunrays" checked={simConfig.SUNRAYS} onChange={(val) => handleSwitchChange("SUNRAYS", val)} />
                                    {simConfig.SUNRAYS && (
                                        <ControlSlider icon={<Settings2 className="h-4 w-4 text-muted-foreground" />} label="Sunrays Weight" value={simConfig.SUNRAYS_WEIGHT} step={0.01} min={0.3} max={1} onChange={(val) => handleSliderChange("SUNRAYS_WEIGHT", val)} />
                                    )}
                                    <ControlSwitch icon={<Settings2 className="h-4 w-4 text-muted-foreground" />} label="Paused" checked={simConfig.PAUSED} onChange={(val) => handleSwitchChange("PAUSED", val)} />
                                    <ControlSwitch icon={<Settings2 className="h-4 w-4 text-muted-foreground" />} label="Transparent BG" checked={simConfig.TRANSPARENT} onChange={(val) => {
                                        handleSwitchChange("TRANSPARENT", val);
                                    }} />


                                    <div className="flex space-x-2 pt-2">
                                        <Button variant="outline" size="sm" onClick={randomSplat} className="flex-1">
                                            <Zap className="mr-2 h-4 w-4" /> Random Splats
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={takeScreenshot} className="flex-1">
                                            <Camera className="mr-2 h-4 w-4" /> Screenshot
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <p>Loading simulation settings...</p>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

interface ControlSliderProps {
    icon: React.ReactNode;
    label: string;
    value?: number;
    step: number;
    min: number;
    max: number;
    onChange: (value: number[]) => void;
}

function ControlSlider({ icon, label, value, step, min, max, onChange }: ControlSliderProps) {
    return (
        <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor={label.toLowerCase().replace(" ", "-")} className="flex items-center col-span-1">
                {icon}
                <span className="ml-2">{label}</span>
            </Label>
            <Slider
                id={label.toLowerCase().replace(" ", "-")}
                value={value !== undefined ? [value] : [min]}
                min={min}
                max={max}
                step={step}
                onValueChange={onChange}
                className="col-span-2"
                disabled={value === undefined}
            />
        </div>
    );
}

interface ControlSwitchProps {
    icon: React.ReactNode;
    label: string;
    checked?: boolean;
    onChange: (checked: boolean) => void;
}

function ControlSwitch({ icon, label, checked, onChange }: ControlSwitchProps) {
    return (
        <div className="flex items-center justify-between space-x-2 py-1">
            <Label htmlFor={label.toLowerCase().replace(" ", "-")} className="flex items-center">
                {icon}
                <span className="ml-2"> {label}</span>
            </Label>
            <Switch
                id={label.toLowerCase().replace(" ", "-")}
                checked={checked}
                onCheckedChange={onChange}
                disabled={checked === undefined}
            />
        </div>
    );
}
