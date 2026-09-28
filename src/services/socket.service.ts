import { Server } from "socket.io";

let io: Server | undefined;

export function initializeSocket(server: Server) {
  io = server;

  io.on("connection", (socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    socket.on("payment.subscribe", ({ paymentId }) => {
      socket.join(`payment:${paymentId}`);

      socket.emit("payment.subscribed", {
        paymentId,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });
}

export function emitPaymentStatus(paymentId: string, status: string) {
  if (!io) {
    return;
  }

  io.to(`payment:${paymentId}`).emit("payment.status.updated", {
    paymentId,
    status,
  });
}
