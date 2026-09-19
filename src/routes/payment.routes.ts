import { Router } from "express";
import { createPixPaymentController } from "../controllers/payment.controller";

const router = Router();

router.post("/pix", createPixPaymentController);

// router.get("/", (req, res) => {
//   const pix = test();
//   console.log(pix);
//   res.send(pix);
// });

export default router;
