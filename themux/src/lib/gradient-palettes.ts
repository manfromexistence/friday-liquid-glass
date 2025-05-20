export interface Gradient {
  id: string;
  name: string;
  css: string;
}

export const PREDEFINED_GRADIENTS: Gradient[] = [
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    css: "linear-gradient(to right, #ff7e5f, #feb47b)",
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    css: "linear-gradient(to right, #2c3e50, #4ca1af)",
  },
];
