import { z } from "zod";

export const bookingSchema = z.object({
  name:        z.string().min(2, "Name is required"),
  email:       z.string().email("Valid email required"),
  phone:       z.string().optional(),
  packageId:   z.string().optional(),
  packageName: z.string().optional(),
  sessionDate: z.string().optional(),
  sessionType: z.string().optional(),
  location:    z.string().optional(),
  notes:       z.string().max(1000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
