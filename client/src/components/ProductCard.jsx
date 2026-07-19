import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const onQuickAdd = () => {
    addToCart({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
      size: product.sizeOptions?.[0] || "M",
      stock: product.stock
    });
    toast.success(`1 x ${product.name} added to cart!`);
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-media-link">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
      </Link>
      <div className="product-info">
        <p className="category-tag">{product.category}</p>
        <Link to={`/products/${product.slug}`} className="product-title-link">
          <h3>{product.name}</h3>
        </Link>
        <p className="product-price">INR {product.price.toLocaleString("en-IN")}</p>
        <div className="product-bottom">
          <span className="rating">{product.rating.toFixed(1)} / 5</span>
          <button className="tiny-btn" type="button" onClick={onQuickAdd}>
            Quick Add
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
