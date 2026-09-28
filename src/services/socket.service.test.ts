import { describe, expect, it, vi } from "vitest";
import { Server } from "socket.io";
import { initializeSocket, emitPaymentStatus } from "./socket.service";

describe("Socket Service", () => {
  it("should subscribe a socket to a payment room", () => {
    const join = vi.fn();
    const emit = vi.fn();

    const socket = {
      id: "socket-123",
      join,
      emit,
      on: vi.fn(),
    };

    const io = {
      on: vi.fn((event, callback) => {
        if (event === "connection") {
          callback(socket);
        }
      }),
    } as unknown as Server;

    initializeSocket(io);

    const subscribeHandler = socket.on.mock.calls.find(
      ([event]) => event === "payment.subscribe",
    )?.[1];

    subscribeHandler({
      paymentId: "payment-123",
    });

    expect(join).toHaveBeenCalledWith("payment:payment-123");

    expect(emit).toHaveBeenCalledWith("payment.subscribed", {
      paymentId: "payment-123",
    });
  });

  it("should handle socket disconnection", () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    const socket = {
      id: "socket-123",
      join: vi.fn(),
      emit: vi.fn(),
      on: vi.fn(),
    };

    const io = {
      on: vi.fn((event, callback) => {
        if (event === "connection") {
          callback(socket);
        }
      }),
    } as unknown as Server;

    initializeSocket(io);

    const disconnectHandler = socket.on.mock.calls.find(
      ([event]) => event === "disconnect",
    )?.[1];

    disconnectHandler();

    expect(consoleLog).toHaveBeenCalledWith("Socket desconectado: socket-123");

    consoleLog.mockRestore();
  });
});
