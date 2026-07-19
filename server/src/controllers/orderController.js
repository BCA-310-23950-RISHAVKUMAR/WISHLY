import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { calculateOrderAmounts, normalizeCartItems } from "../utils/orderPricing.js";

const applyStatusCode = (res, error) => {
  if (error?.statusCode) {
    res.status(error.statusCode);
  }
};

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = "COD", payment = null } = req.body;

  let normalizedItems;
  try {
    normalizedItems = await normalizeCartItems(items);
  } catch (error) {
    applyStatusCode(res, error);
    throw error;
  }

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculateOrderAmounts(normalizedItems);

  const selectedMethod = String(paymentMethod || "COD").toUpperCase();
  const isOnlinePayment = selectedMethod !== "COD";

  if (isOnlinePayment && payment?.status !== "paid") {
    res.status(400);
    throw new Error("Online payment is required before placing this order");
  }

  const paymentResult = payment
    ? {
        provider: payment.provider || selectedMethod,
        mode: payment.mode || "demo",
        sessionId: payment.sessionId || "",
        transactionId: payment.transactionId || "",
        signature: payment.signature || "",
        paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date()
      }
    : {
        provider: selectedMethod,
        mode: "demo",
        sessionId: "",
        transactionId: "",
        signature: ""
      };

  const order = await Order.create({
    user: req.user._id,
    items: normalizedItems.map(({ productId, ...item }) => item),
    shippingAddress,
    paymentMethod: selectedMethod,
    paymentStatus: selectedMethod === "UPI" ? "Pending" : (isOnlinePayment ? "Paid" : "Pending"),
    paymentResult,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  });

  for (const item of normalizedItems) {
    await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
  }

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (String(order.user) !== String(req.user._id) && !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json(order);
});

export const getAdminOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const allowedStatus = ["Processing", "Packed", "Shipped", "Delivered"];
  const allowedPaymentStatus = ["Pending", "Paid", "Failed"];

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (status) {
    if (!allowedStatus.includes(status)) {
      res.status(400);
      throw new Error("Invalid order status");
    }
    order.status = status;
  }

  if (paymentStatus) {
    if (!allowedPaymentStatus.includes(paymentStatus)) {
      res.status(400);
      throw new Error("Invalid payment status");
    }
    order.paymentStatus = paymentStatus;
  }

  const updated = await order.save();
  res.json(updated);
});
