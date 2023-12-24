import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// To overwrite the style anywhere we render the button
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
