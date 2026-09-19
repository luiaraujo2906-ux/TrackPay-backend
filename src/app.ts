import express from "express";
import paymentRoutes from "./routes/payment.routes";
import webhookRoutes from "./routes/webhook.routes";

const app = express();

app.use(express.json());

app.use(express.static("public"));

app.use("/payments", paymentRoutes);

app.use("/webhooks", webhookRoutes);

export default app;
