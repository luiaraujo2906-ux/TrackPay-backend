import crypto from "node:crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app";
import {
  createPayment,
  findPaymentById,
  getPaymentStatus,
} from "../repositories/payment.repository";

function createWebhookPayload(providerPaymentId: string) {
  switch (process.env.PAYMENT_PROVIDER) {
    case "asaas":
      return {
        id: crypto.randomUUID(),
        event: "PAYMENT_RECEIVED",
        payment: {
          id: providerPaymentId,
          status: "RECEIVED",
        },
      };

    case "fake":
      return {
        providerPaymentId,
        status: "PAID",
      };

    default:
      throw new Error("Invalid payment provider");
  }
}

describe("POST /webhooks/payment", () => {
  it("should update an existing payment status when payment is received", async () => {
    const paymentId = crypto.randomUUID();
    const providerPaymentId = crypto.randomUUID();

    await createPayment({
      id: paymentId,
      amount: 50,
      status: "PENDING",
      pixCode: "pix-code",
      providerPaymentId,
    });

    const response = await request(app)
      .post("/webhooks/payment")
      .send(createWebhookPayload(providerPaymentId));

    const payment = await findPaymentById(paymentId);

    expect(response.status).toBe(200);
    expect(payment).not.toBeNull();
    expect(payment?.status).toBe("PAID");
  });

  it("should return 404 when payment does not exist", async () => {
    const response = await request(app)
      .post("/webhooks/payment")
      .send(createWebhookPayload("does-not-exist"));

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Payment not found",
    });
  });

  it("should safely process the same webhook more than once", async () => {
    const paymentId = crypto.randomUUID();
    const providerPaymentId = crypto.randomUUID();

    await createPayment({
      id: paymentId,
      amount: 50,
      status: "PENDING",
      pixCode: "text-pi-code",
      providerPaymentId,
    });

    const webhook = createWebhookPayload(providerPaymentId);

    const firstResponse = await request(app)
      .post("/webhooks/payment")
      .send(webhook);

    const secondResponse = await request(app)
      .post("/webhooks/payment")
      .send(webhook);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);

    const status = await getPaymentStatus(paymentId);

    expect(status).toBe("PAID");
  });

  it("should return 400 when webhook payload is invalid", async () => {
    let invalidPayload;

    switch (process.env.PAYMENT_PROVIDER) {
      case "asaas":
        invalidPayload = {
          id: "",
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "",
            status: "",
          },
        };
        break;

      case "fake":
        invalidPayload = {
          providerPaymentId: "",
          status: "INVALID_STATUS",
        };
        break;

      default:
        throw new Error("Invalid payment provider");
    }

    const response = await request(app)
      .post("/webhooks/payment")
      .send(invalidPayload);

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Invalid webhook payload",
    });
  });

  it("should return 409 when payment status transition is invalid", async () => {
    const paymentId = crypto.randomUUID();
    const providerPaymentId = crypto.randomUUID();

    await createPayment({
      id: paymentId,
      amount: 50,
      status: "EXPIRED",
      pixCode: "pix-code",
      providerPaymentId,
    });

    const response = await request(app)
      .post("/webhooks/payment")
      .send(createWebhookPayload(providerPaymentId));

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      message: "Invalid payment status transition",
    });

    const payment = await findPaymentById(paymentId);

    expect(payment?.status).toBe("EXPIRED");
  });
});
