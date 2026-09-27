import { Request, Response } from "express";

import { createWebhookProvider } from "../providers/webhook.provider";
import { processPaymentWebhook } from "../services/webhook.service";

const webhookProvider = createWebhookProvider();

export async function handlePaymentWebhook(req: Request, res: Response) {
  try {
    const webhookData = webhookProvider.parseWebhook(req.body);

    await processPaymentWebhook(webhookData);

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid webhook payload") {
      return res.status(400).json({
        message: "Invalid webhook payload",
      });
    }

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
