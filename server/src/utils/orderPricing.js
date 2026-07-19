import mongoose from "mongoose";
import Product from "../models/Product.js";

const roundCurrency = (value) => Math.round(value * 100) / 100;

export const normalizeCartItems = async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  const productIds = items.map((item) => item.productId).filter(Boolean);
  const validIds = productIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (validIds.length !== productIds.length) {
    const error = new Error("Invalid product id in cart");
    error.statusCode = 400;
    throw error;
  }

  const products = await Product.find({ _id: { $in: validIds } }).lean();
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const normalizedItems = items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      const error = new Error("One or more products were not found");
      error.statusCode = 404;
      throw error;
    }

    const quantity = Number(item.quantity) || 1;
    if (quantity > product.stock) {
      const error = new Error(`${product.name} is out of stock for requested quantity`);
      error.statusCode = 400;
      throw error;
    }

    return {
      product: product._id,
      productId: String(product._id),
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      size: item.size || product.sizeOptions?.[0] || "M"
    };
  });

  return normalizedItems;
};

export const calculateOrderAmounts = (normalizedItems) => {
  const itemsPrice = roundCurrency(
    normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const shippingPrice = itemsPrice >= 2500 ? 0 : 99;
  const taxPrice = roundCurrency(itemsPrice * 0.05);
  const totalPrice = roundCurrency(itemsPrice + shippingPrice + taxPrice);

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

export { roundCurrency };
