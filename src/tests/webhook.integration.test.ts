import crypto from "node:crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app";
import {
  createPayment,
  findPaymentById,
  getPaymentStatus,
} from "../repositories/payment.repository";

describe("POST /webhooks/payment", () => {
  it("should update an existing payment status", async () => {
    const paymentId = crypto.randomUUID();
    const providerPaymentId = crypto.randomUUID();

    await createPayment({
      id: paymentId,
      amount: 50,
      status: "PENDING",
      pixCode: "pix-code",
      providerPaymentId,
    });

    const response = await request(app).post("/webhooks/payment").send({
      providerPaymentId,
      status: "PAID",
    });

    const payment = await findPaymentById(paymentId);

    expect(response.status).toBe(200);
    expect(payment).not.toBeNull();
    expect(payment?.status).toBe("PAID");
  });

  it("should return 404 when payment does not exist", async () => {
    const response = await request(app).post("/webhooks/payment").send({
      providerPaymentId: "does-not-exist",
      status: "PAID",
    });

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

    const firstResponse = await request(app).post("/webhooks/payment").send({
      providerPaymentId,
      status: "PAID",
    });

    const secondResponse = await request(app).post("/webhooks/payment").send({
      providerPaymentId,
      status: "PAID",
    });

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);

    const status = await getPaymentStatus(paymentId);

    expect(status).toBe("PAID");
  });

  it("should return 400 when webhook payload is invalid", async () => {
    const response = await request(app).post("/webhooks/payment").send({
      providerPaymentId: "",
      status: "INVALID_STATUS",
    });

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
      status: "PAID",
      pixCode: "pix-code",
      providerPaymentId,
    });

    const response = await request(app).post("/webhooks/payment").send({
      providerPaymentId,
      status: "CANCELLED",
    });

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      message: "Invalid payment status transition",
    });

    const payment = await findPaymentById(paymentId);

    expect(payment?.status).toBe("PAID");
  });
});
