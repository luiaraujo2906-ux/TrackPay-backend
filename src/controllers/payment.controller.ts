import { Request, Response } from "express";

import { createPaymentSchema } from "../schemas/payment.schema";
import { createPixPayment } from "../services/payment.service";

export async function handleCreatePayment(req: Request, res: Response) {
  const result = createPaymentSchema.safeParse(req.body);

  if (!result.success) {
    const firstError = result.error.issues[0];

    return res.status(400).json({
      message: firstError?.message ?? "Invalid payment data",
    });
  }

  try {
    const payment = await createPixPayment(result.data);

    return res.status(201).json(payment);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create Pix payment",
    });
  }
}
