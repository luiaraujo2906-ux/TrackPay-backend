import { Request, Response } from "express";

import { paymentWebhookSchema } from "../schemas/webhook.schema";
import { processPaymentWebhook } from "../services/webhook.service";

export async function handlePaymentWebhook(req: Request, res: Response) {
  const result = paymentWebhookSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid webhook payload",
    });
  }

  try {
    await processPaymentWebhook(result.data);

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof Error && error.message === "Payment not found") {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid payment status transition"
    ) {
      return res.status(409).json({
        message: "Invalid payment status transition",
      });
    }

    return res.sendStatus(500);
  }
}
