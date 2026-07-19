import express from "express";
import {
  createOrder,
  getAdminOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/admin/all", protect, adminOnly, getAdminOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);
router.get("/:id", protect, getOrderById);

export default router;
