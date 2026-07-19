import crypto from "crypto";
import asyncHandler from "express-async-handler";
import env from "../config/env.js";
import { calculateOrderAmounts, normalizeCartItems } from "../utils/orderPricing.js";

const supportedMethods = ["RAZORPAY", "STRIPE", "UPI"];

const getDemoSession = (method, amount) => ({
  mode: "demo",
  provider: method,
  sessionId: `demo_${method.toLowerCase()}_${Date.now()}`,
  amount,
  currency: "INR"
});

export const createPaymentSession = asyncHandler(async (req, res) => {
  const { items, method } = req.body;
  const provider = String(method || "").toUpperCase();

  if (!supportedMethods.includes(provider)) {
    res.status(400);
    throw new Error("Unsupported payment method");
  }

  const normalizedItems = await normalizeCartItems(items);
  const { totalPrice } = calculateOrderAmounts(normalizedItems);

  if (provider === "UPI") {
    return res.json({
      mode: "qr",
      provider: "UPI",
      sessionId: `upi_${Date.now()}`,
      amount: totalPrice,
      currency: "INR"
    });
  }

  const amountInPaise = Math.round(totalPrice * 100);

  if (env.enableLivePayments && provider === "STRIPE" && env.stripeSecretKey) {
    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(env.stripeSecretKey);
      const intent = await stripe.paymentIntents.create({
        amount: amountInPaise,
        currency: "inr",
        metadata: {
          app: "wishly",
          userId: String(req.user._id)
        }
      });

      return res.json({
        mode: "live",
        provider,
        sessionId: intent.id,
        clientSecret: intent.client_secret,
        amount: totalPrice,
        currency: "INR"
      });
    } catch (error) {
      console.warn("Stripe payment session failed, falling back to demo mode:", error.message);
    }
  }

  if (env.enableLivePayments && provider === "RAZORPAY" && env.razorpayKeyId && env.razorpayKeySecret) {
    try {
      const { default: Razorpay } = await import("razorpay");
      const razorpay = new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret
      });

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `wishly-${Date.now()}`,
        notes: {
          userId: String(req.user._id)
        }
      });

      return res.json({
        mode: "live",
        provider,
        sessionId: order.id,
        keyId: env.razorpayKeyId,
        amount: totalPrice,
        currency: "INR"
      });
    } catch (error) {
      console.warn("Razorpay payment session failed, falling back to demo mode:", error.message);
    }
  }

  res.json(getDemoSession(provider, totalPrice));
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const { provider, mode = "demo", sessionId = "", transactionId = "", signature = "" } = req.body;
  const paymentProvider = String(provider || "").toUpperCase();

  if (!supportedMethods.includes(paymentProvider)) {
    res.status(400);
    throw new Error("Unsupported payment provider");
  }

  if (env.enableLivePayments && mode === "live" && paymentProvider === "STRIPE" && env.stripeSecretKey && sessionId) {
    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(env.stripeSecretKey);
      const intent = await stripe.paymentIntents.retrieve(sessionId);
      const isPaid = intent.status === "succeeded";
      if (!isPaid) {
        res.status(400);
        throw new Error("Stripe payment is not completed yet");
      }
      return res.json({
        status: "paid",
        provider: paymentProvider,
        mode,
        sessionId,
        transactionId: intent.id,
        paidAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn("Stripe payment confirmation failed:", error.message);
      res.status(400);
      throw new Error(error.message || "Stripe payment verification failed");
    }
  }

  if (env.enableLivePayments && mode === "live" && paymentProvider === "RAZORPAY" && env.razorpayKeySecret && sessionId) {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", env.razorpayKeySecret)
        .update(`${sessionId}|${transactionId}`)
        .digest("hex");

      if (!signature || signature !== expectedSignature) {
        res.status(400);
        throw new Error("Invalid Razorpay signature");
      }

      return res.json({
        status: "paid",
        provider: paymentProvider,
        mode,
        sessionId,
        transactionId,
        signature,
        paidAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn("Razorpay payment confirmation failed:", error.message);
      res.status(400);
      throw new Error(error.message || "Razorpay payment verification failed");
    }
  }

  // Default test flow for local college-project demo.
  res.json({
    status: "paid",
    provider: paymentProvider,
    mode: "demo",
    sessionId: sessionId || `demo_${paymentProvider.toLowerCase()}_${Date.now()}`,
    transactionId: transactionId || `txn_${Math.random().toString(36).slice(2, 10)}`,
    paidAt: new Date().toISOString()
  });
});
