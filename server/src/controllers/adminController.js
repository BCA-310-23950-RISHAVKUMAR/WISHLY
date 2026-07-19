import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const resolveUniqueSlug = async (name, existingId = null) => {
  const base = toSlug(name) || `product-${Date.now()}`;
  let candidate = base;
  let count = 1;

  while (true) {
    const existing = await Product.findOne({ slug: candidate }).select("_id");
    if (!existing || String(existing._id) === String(existingId)) {
      return candidate;
    }
    count += 1;
    candidate = `${base}-${count}`;
  }
};

export const getAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  res.json(products);
});

export const createAdminProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    image,
    stock,
    brand = "Wishly",
    sizeOptions = ["S", "M", "L", "XL"],
    tags = [],
    isFeatured = false
  } = req.body;

  if (!name || !description || !image || !category) {
    res.status(400);
    throw new Error("Name, description, image and category are required");
  }

  const slug = await resolveUniqueSlug(name);

  const product = await Product.create({
    name,
    slug,
    description,
    price: Number(price) || 0,
    brand,
    category,
    sizeOptions: Array.isArray(sizeOptions) ? sizeOptions : ["S", "M", "L", "XL"],
    image,
    gallery: [],
    stock: Number(stock) || 0,
    rating: 4.5,
    reviewsCount: 0,
    tags: Array.isArray(tags) ? tags : [],
    isFeatured: Boolean(isFeatured)
  });

  res.status(201).json(product);
});

export const updateAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const patch = req.body;
  if (patch.name && patch.name !== product.name) {
    product.slug = await resolveUniqueSlug(patch.name, product._id);
    product.name = patch.name;
  }

  const mutableFields = [
    "description",
    "category",
    "brand",
    "image",
    "gallery",
    "sizeOptions",
    "tags",
    "isFeatured"
  ];

  mutableFields.forEach((field) => {
    if (field in patch) {
      product[field] = patch[field];
    }
  });

  if ("price" in patch) {
    product.price = Number(patch.price) || 0;
  }

  if ("stock" in patch) {
    product.stock = Number(patch.stock) || 0;
  }

  const updated = await product.save();
  res.json(updated);
});

export const deleteAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();
  res.json({ message: "Product deleted" });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const [productsCount, usersCount, ordersCount, revenueAgg] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ])
  ]);

  res.json({
    productsCount,
    usersCount,
    ordersCount,
    totalRevenue: revenueAgg?.[0]?.totalRevenue || 0
  });
});
