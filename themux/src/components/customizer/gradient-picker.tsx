"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { PREDEFINED_GRADIENTS, Gradient } from "@/lib/gradient-palettes"; // Assuming this path is correct

interface GradientPickerProps {
    value: string;
    onValueChange: (value: string) => void;
}

export function GradientPicker({ value, onValueChange }: GradientPickerProps) {
    const [open, setOpen] = React.useState(false);
    const selectedGradient = PREDEFINED_GRADIENTS.find(
        (gradient) => gradient.id === value
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {selectedGradient ? selectedGradient.name : "Select gradient..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search gradient..." />
                    <CommandList>
                        <CommandEmpty>No gradient found.</CommandEmpty>
                        <CommandGroup>
                            {PREDEFINED_GRADIENTS.map((gradient) => (
                                <CommandItem
                                    key={gradient.id}
                                    value={gradient.id}
                                    onSelect={(currentValue) => {
                                        onValueChange(
                                            currentValue === value ? "" : currentValue
                                        );
                                        setOpen(false);
                                    }}
                                >

                                    <div
                                        className="w-4 h-4 mr-2 rounded-full flex items-center justify-center"
                                        style={{ background: gradient.css }}
                                    >
                                        <Check
                                            className={cn(
                                                "max-h-3 max-w-3 text-primary",
                                                value === gradient.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </div>
                                    {gradient.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
