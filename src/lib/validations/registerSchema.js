import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  // Username is removed from here (generated automatically)
  password: z.string().min(6, "Password must be at least 6 characters."),
  college: z.string().min(1, "Please select your college."),
  year: z.string().min(1, "Please select your year."),
  branch: z.string().min(1, "Please select your branch."),
  rollNo: z.string().min(3, "Please enter a valid roll number."),
});