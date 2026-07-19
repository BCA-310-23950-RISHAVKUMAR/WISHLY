import express from "express";
import { confirmPayment, createPaymentSession } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/session", createPaymentSession);
router.post("/confirm", confirmPayment);

export default router;
