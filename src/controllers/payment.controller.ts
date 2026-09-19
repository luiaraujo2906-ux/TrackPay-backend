import type { Request, Response } from "express";
import { createPixPayment } from "../services/payment.service";

export async function createPixPaymentController(req: Request, res: Response) {
  const { amount } = req.body ?? {};

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      message: "Amount must be a positive number",
    });
  }

  if (!amount) {
    return res.status(400).json({
      message: "Amount is required",
    });
  }

  try {
    const payment = await createPixPayment({
      amount,
    });

    // console.log("New Payment:", payment, "\n");

    return res.status(201).json(payment);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Unable to create Pix payment",
    });
  }
}
