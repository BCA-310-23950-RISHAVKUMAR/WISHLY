import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { useCart } from "../context/CartContext";
import SkeletonCard from "../components/SkeletonCard";
import { toast } from "react-toastify";

const ProductPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [size, setSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
        setSize(data.sizeOptions?.[0] || "M");
        setActiveImage(data.image);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load product"));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <section className="container section">
        <div className="product-grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="container section">
        <p className="error-text">{error || "Product not found"}</p>
        <Link to="/products" className="text-link">
          Back to Products
        </Link>
      </section>
    );
  }

  const gallery = [product.image, ...(product.gallery || [])].filter(Boolean);

  return (
    <section className="container section">
      <div className="product-layout reveal">
        <div>
          <img src={activeImage} alt={product.name} className="product-detail-image" />
          <div className="thumb-row">
            {gallery.map((img) => (
              <button
                key={img}
                type="button"
                className={`thumb ${img === activeImage ? "active" : ""}`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={product.name} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-panel">
          <p className="eyebrow">{product.category}</p>
          <h2>{product.name}</h2>
          <p className="product-price large">INR {product.price.toLocaleString("en-IN")}</p>
          <div className="product-description" dangerouslySetInnerHTML={{ __html: product.description }} />
          <p className="muted">
            Rating: {product.rating.toFixed(1)} ({product.reviewsCount} reviews)
          </p>

          <label className="field-label">
            Size
            <select className="input" value={size} onChange={(e) => setSize(e.target.value)}>
              {(product.sizeOptions || ["M"]).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Quantity
            <input
              className="input"
              type="number"
              min="1"
              max={product.stock || 1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))
              }
            />
          </label>

          <button
            className="primary-btn full"
            type="button"
            onClick={() => {
              addToCart({
                productId: product._id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity,
                size,
                stock: product.stock
              });
              toast.success(`${quantity} x ${product.name} added to cart!`);
            }}
          >
            Add To Cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductPage;
