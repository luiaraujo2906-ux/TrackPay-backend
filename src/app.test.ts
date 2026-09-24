import { describe, expect, test, vi, afterEach } from "vitest";
import request from "supertest";

import app from "./app";
import * as paymentService from "./services/payment.service";

afterEach(() => {
  vi.restoreAllMocks();
});

const fakePayload = {
  amount: 50,
  payer: {
    name: "Cliente Teste",
    email: "test@example.com",
    identification: {
      type: "CPF",
      number: "12345678900",
    },
  },
};

describe("POST /payments/pix", () => {
  test("should create a Pix payment", async () => {
    const response = await request(app).post("/payments/pix").send(fakePayload);

    expect(response.status).toBe(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.amount).toBe(fakePayload.amount);
    expect(response.body.status).toBe("PENDING");
    expect(response.body.pixCode).toBeDefined();
    expect(response.body.qrCode).toBeDefined();
  });

  test("should reject a negative amount", async () => {
    const response = await request(app)
      .post("/payments/pix")
      .send({
        ...fakePayload,
        amount: -10,
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Amount must be a positive number");
  });

  test("should reject zero amount", async () => {
    const response = await request(app).post("/payments/pix").send({
      amount: 0,
    });

    expect(response.status).toBe(400);
  });

  test("should reject a string amount", async () => {
    const response = await request(app).post("/payments/pix").send({
      amount: "10",
    });

    expect(response.status).toBe(400);
  });

  test("should reject a missing amount", async () => {
    const response = await request(app).post("/payments/pix").send({});

    expect(response.status).toBe(400);
  });
});

test("should return 500 when payment creation fails", async () => {
  vi.spyOn(paymentService, "createPixPayment").mockRejectedValue(
    new Error("Database error"),
  );

  const response = await request(app).post("/payments/pix").send(fakePayload);

  expect(response.status).toBe(500);

  expect(response.body).toEqual({
    message: "Unable to create Pix payment",
  });
});
