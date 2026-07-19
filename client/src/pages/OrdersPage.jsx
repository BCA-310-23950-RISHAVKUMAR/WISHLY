import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import DownloadInvoiceModal from "../components/DownloadInvoiceModal";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderForDownload, setSelectedOrderForDownload] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my");
        setOrders(data);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load orders"));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <section className="container section">
      <div className="section-head">
        <h2>My Orders</h2>
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="orders-list">
        {orders.map((order) => (
          <article key={order._id} className="panel order-card">
            <div className="order-head">
              <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
              <span className="status-pill">{order.status}</span>
            </div>
            <p className="muted">
              {new Date(order.createdAt).toLocaleString("en-IN")} | {order.items.length} items
            </p>
            <p>Total: INR {order.totalPrice.toFixed(2)}</p>
            <p className="muted">
              Payment: {order.paymentMethod} | Status: {order.paymentStatus || "Pending"}
            </p>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="tiny-btn"
                onClick={() => setSelectedOrderForDownload(order)}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Bill
              </button>
            </div>
          </article>
        ))}
      </div>

      {!loading && !error && orders.length === 0 && <p className="muted">No orders yet.</p>}

      {selectedOrderForDownload && (
        <DownloadInvoiceModal
          order={selectedOrderForDownload}
          onClose={() => setSelectedOrderForDownload(null)}
        />
      )}
    </section>
  );
};

export default OrdersPage;
