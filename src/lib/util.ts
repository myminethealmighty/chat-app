import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// To overwrite the style anywhere we render the button
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createChatHref = (id1: string, id2: string) => {
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}--${sortedIds[1]}`;
};

export const pusherKeyString = (key: string) => {
  return key.replace(/:/g, "__");
};
