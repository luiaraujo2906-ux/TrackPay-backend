import { Router } from "express";
import { handleCreatePayment } from "../controllers/payment.controller";

const router = Router();

router.post("/pix", handleCreatePayment);

// router.get("/", (req, res) => {
//   const pix = test();
//   console.log(pix);
//   res.send(pix);
// });

export default router;
