import express from "express";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  getAdminStats,
  updateAdminProduct
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.put("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);

export default router;
