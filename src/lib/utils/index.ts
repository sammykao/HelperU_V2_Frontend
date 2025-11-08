// Export all utility functions
export * from "./format";
export * from "./validation";
export * from "./storage";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
