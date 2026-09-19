import { db } from "../config/database";
import type { CreatePayment, Payment, PaymentStatus } from "../types/payment.types";

export async function createPayment(
  payment: CreatePayment,
): Promise<void> {
  await db.execute(
    `
      INSERT INTO payments (
        id,
        provider_payment_id,
        amount,
        status,
        pix_code
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [payment.id, payment.providerPaymentId, payment.amount, payment.status, payment.pixCode],
  );
}

export async function findPaymentById(
  paymentId: string,
): Promise<Payment | null> {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        amount,
        status,
        pix_code AS pixCode,
        provider_payment_id AS providerPaymentId,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM payments
      WHERE id = ?
    `,
    [paymentId],
  );

  const payments = rows as Payment[];

  return payments[0] ?? null;
}

export async function findPaymentByProviderId(
  providerPaymentId: string,
): Promise<Payment | null> {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        amount,
        status,
        pix_code AS pixCode,
        provider_payment_id AS providerPaymentId,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM payments
      WHERE provider_payment_id = ?
    `,
    [providerPaymentId],
  );

  const payments = rows as Payment[];

  return payments[0] ?? null;
}

export async function updatePaymentStatus(
  id: string,
  status: string,
): Promise<void> {
  await db.execute(
    `
      UPDATE payments
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [status, id],
  );
}

export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatus | null> {
  const [rows] = await db.execute(
    `
      SELECT status
      FROM payments
      WHERE id = ?
    `,
    [paymentId],
  );

  const payments = rows as { status: PaymentStatus }[];

  return payments[0]?.status ?? null;
}
