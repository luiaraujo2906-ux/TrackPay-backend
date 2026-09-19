import { z } from "zod";

import { paymentStatusSchema } from "./payment.schema";

export const paymentWebhookSchema = z.object({
  providerPaymentId: z.string().min(1),
  status: paymentStatusSchema,
});
