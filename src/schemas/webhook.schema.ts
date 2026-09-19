import { z } from "zod";
import { paymentStatusSchema } from "./payment.schema";

export const paymentWebhookSchema = z.object({
  paymentId: z.string(),
  status: paymentStatusSchema,
});
