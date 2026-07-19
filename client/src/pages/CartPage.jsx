import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { items, removeFromCart, updateQuantity, totals } = useCart();

  return (
    <section className="container section">
      <div className="section-head">
        <h2>Shopping Cart</h2>
      </div>

      {items.length === 0 ? (
        <div className="empty-box">
          <p>Your cart is empty.</p>
          <Link to="/products" className="primary-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article key={`${item.productId}-${item.size}`} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <Link to={`/products/${item.slug}`} className="text-link">
                    {item.name}
                  </Link>
                  <p className="muted">Size: {item.size}</p>
                  <p>INR {item.price.toLocaleString("en-IN")}</p>
                </div>
                <input
                  className="input qty"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, item.size, e.target.value)}
                />
                <button
                  type="button"
                  className="ghost-btn danger"
                  onClick={() => removeFromCart(item.productId, item.size)}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>

          <aside className="summary-box">
            <h3>Order Summary</h3>
            <p>
              Subtotal <span>INR {totals.subtotal.toFixed(2)}</span>
            </p>
            <p>
              Shipping <span>INR {totals.shipping.toFixed(2)}</span>
            </p>
            <p>
              Tax (5%) <span>INR {totals.tax.toFixed(2)}</span>
            </p>
            <hr />
            <p className="summary-total">
              Total <span>INR {totals.total.toFixed(2)}</span>
            </p>
            <button
              className="primary-btn full"
              type="button"
              onClick={() => navigate(isLoggedIn ? "/checkout" : "/login")}
            >
              Proceed To Checkout
            </button>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CartPage;
