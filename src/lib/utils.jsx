import { clsx } from "clsx"; // (npm install clsx)
import { twMerge } from "tailwind-merge"; // (npm install tailwind-merge)

// This is a standard helper function from ShadCN
// It merges Tailwind classes without conflicts.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}