import { z } from "zod";

export const reservationSchema = z.object({
  tourName: z.string().min(1),
  date: z.string().min(1, "date"),
  travelers: z.coerce.number().int().min(1, "travelers").max(30, "travelersMax"),
  fullName: z.string().min(2, "fullName"),
  email: z.string().email("email"),
  whatsapp: z.string().min(9, "whatsapp"),
  message: z.string().max(500, "messageMax").optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export type ReservationPayload = ReservationInput & { website?: string };

export type ReservationErrorField = "date" | "travelers" | "fullName" | "email" | "whatsapp" | "messageMax";

export interface ReservationRecord extends ReservationInput {
  code: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}