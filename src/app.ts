import express from "express";
import paymentRoutes from "./routes/payment.routes";
import webhookRoutes from "./routes/webhook.routes";
import { emitPaymentStatus } from "./services/socket.service";

const app = express();

app.use(express.json());

app.use(express.static("public"));

app.use("/payments", paymentRoutes);

app.use("/webhooks", webhookRoutes);

app.use("/health", (req, res) => {
  res.send("OK");
});

app.use("/confirm", (req, res) => {
  emitPaymentStatus("payment-123", "PAID");
  res.send("OK");
});

export default app;
