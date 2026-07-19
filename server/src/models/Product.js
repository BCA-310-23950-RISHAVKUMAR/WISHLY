import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    brand: {
      type: String,
      default: "Wishly"
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    sizeOptions: {
      type: [String],
      default: ["S", "M", "L", "XL"]
    },
    image: {
      type: String,
      required: true
    },
    gallery: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    tags: {
      type: [String],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
