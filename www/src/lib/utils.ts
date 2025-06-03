import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const copyToClipboard = (text: string) => {
  if (window === undefined) return;
  window.navigator.clipboard.writeText(text);
};

export function getComponentName(name: string) {
  // convert kebab-case to title case
  return name.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getRandomIndex(array: any[]) {
  return Math.floor(Math.random() * array.length);
}

export function stripPrefixes(text: string): string {
  // Check for all standard prefixes
  const prefixes = [
    "Image: ", 
    "Thinking: ", 
    "Search: ", 
    "Research: ", 
    "Canvas: "
  ];
  
  // Remove the prefix if found at the start of the text
  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      return text.substring(prefix.length);
    }
  }
  
  return text;
}
