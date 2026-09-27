import { db } from "../config/database";
import type {
  CreatePayment,
  Payment,
  PaymentStatus,
} from "../types/payment.types";

export async function createPayment(payment: CreatePayment): Promise<void> {
  await db.execute(
    `
      INSERT INTO payments (
        id,
        amount,
        status,
        pix_code,
        provider_reference
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      payment.id,
      payment.amount,
      payment.status,
      payment.pixCode,
      payment.providerReference,
    ],
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
        provider_reference AS providerReference,
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

export async function findPaymentByProviderReference(
  providerReference: string,
): Promise<Payment | null> {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        amount,
        status,
        pix_code AS pixCode,
        provider_reference AS providerReference,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM payments
      WHERE provider_reference = ?
    `,
    [providerReference],
  );

  const payments = rows as Payment[];

  return payments[0] ?? null;
}

export async function findPaymentByProviderId(
  providerReference: string,
): Promise<Payment | null> {
  return findPaymentByProviderReference(providerReference);
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
