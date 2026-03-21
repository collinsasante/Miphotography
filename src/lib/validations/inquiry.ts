import { z } from "zod";

export const inquirySchema = z.object({
  name:    z.string().min(2, "Name is required"),
  email:   z.string().email("Valid email required"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type:    z.enum(["General", "Booking", "Pricing", "Gallery"]),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
