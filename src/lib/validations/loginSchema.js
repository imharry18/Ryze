import { z } from "zod"; // You'll need to run: npm install zod

// This is the Zod schema for your login form.
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required."),
});