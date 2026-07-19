import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { generateProfitLossPDF } from "../utils/reportGenerator";
import { generateInvoicePDF } from "../utils/pdfGenerator";

const blankProduct = {
  name: "",
  description: "",
  price: "",
  category: "Tops",
  image: "",
  stock: "",
  sizeOptions: "S,M,L,XL",
  tags: "men,premium",
  isFeatured: false
};

const AdminPage = () => {
  const [tab, setTab] = useState("products");
  const [stats, setStats] = useState({
    productsCount: 0,
    usersCount: 0,
    ordersCount: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(blankProduct);
  const [editingId, setEditingId] = useState("");
  const [costMargin, setCostMargin] = useState(60);
  const [fixedExpenses, setFixedExpenses] = useState(5000);

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/products"),
        api.get("/orders/admin/all")
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load admin data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const onSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        sizeOptions: form.sizeOptions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        tags: form.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      };

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }

      setForm(blankProduct);
      setEditingId("");
      await fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save product"));
    } finally {
      setSaving(false);
    }
  };

  const onEditProduct = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "Tops",
      image: product.image || "",
      stock: product.stock || "",
      sizeOptions: (product.sizeOptions || []).join(","),
      tags: (product.tags || []).join(","),
      isFeatured: Boolean(product.isFeatured)
    });
    setTab("products");
  };

  const onDeleteProduct = async (productId) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      await fetchAdminData();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete product"));
    }
  };

  const uploadProductImage = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/uploads/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload image"));
    } finally {
      setUploadingImage(false);
    }
  };

  const updateOrder = async (orderId, patch) => {
    try {
      await api.patch(`/orders/${orderId}/status`, patch);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, ...patch } : order))
      );
    } catch (err) {
      setError(getErrorMessage(err, "Could not update order"));
    }
  };

  const statsCards = useMemo(
    () => [
      { label: "Products", value: stats.productsCount },
      { label: "Users", value: stats.usersCount },
      { label: "Orders", value: stats.ordersCount },
      { label: "Revenue", value: `INR ${Number(stats.totalRevenue || 0).toFixed(2)}` }
    ],
    [stats]
  );

  const finances = useMemo(() => {
    let totalItemsPrice = 0;
    let totalShipping = 0;
    let totalTax = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      if (order.paymentStatus === "Paid" || order.status !== "Cancelled") {
        totalItemsPrice += order.itemsPrice || 0;
        totalShipping += order.shippingPrice || 0;
        totalTax += order.taxPrice || 0;
        totalRevenue += order.totalPrice || 0;
      }
    });

    const cogs = totalItemsPrice * (costMargin / 100);
    const grossProfit = totalItemsPrice - cogs;
    const totalExpenses = cogs + totalTax + fixedExpenses;
    const netProfit = totalItemsPrice - cogs - totalTax - fixedExpenses;
    const isProfit = netProfit >= 0;

    return {
      totalItemsPrice,
      totalShipping,
      totalTax,
      totalRevenue,
      cogs,
      grossProfit,
      totalExpenses,
      netProfit,
      isProfit
    };
  }, [orders, costMargin, fixedExpenses]);

  return (
    <section className="container section">
      <div className="section-head">
        <div>
          <p className="eyebrow">ADMIN PANEL</p>
          <h2>Store Management</h2>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="admin-stats">
        {statsCards.map((card) => (
          <article key={card.label} className="panel stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={`ghost-btn ${tab === "products" ? "active" : ""}`}
          onClick={() => setTab("products")}
        >
          Products
        </button>
        <button
          type="button"
          className={`ghost-btn ${tab === "orders" ? "active" : ""}`}
          onClick={() => setTab("orders")}
        >
          Orders
        </button>
        <button
          type="button"
          className={`ghost-btn ${tab === "reports" ? "active" : ""}`}
          onClick={() => setTab("reports")}
        >
          Financial Report
        </button>
        <Link to="/admin/add-product" className="ghost-btn">
          Add Product (Full Stack Form)
        </Link>
      </div>

      {loading ? (
        <p>Loading admin dashboard...</p>
      ) : (
        <>
          {tab === "products" && (
            <div className="admin-layout">
              <form className="panel form-grid" onSubmit={onSaveProduct}>
                <h3>{editingId ? "Edit Product" : "Add Product"}</h3>
                <label className="field-label">
                  Name
                  <input
                    className="input"
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </label>
                <label className="field-label">
                  Description
                  <ReactQuill
                    theme="snow"
                    value={form.description}
                    onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
                    className="rich-editor"
                  />
                </label>
                <label className="field-label">
                  Price
                  <input
                    className="input"
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </label>
                <label className="field-label">
                  Stock
                  <input
                    className="input"
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                  />
                </label>
                <label className="field-label">
                  Category
                  <input
                    className="input"
                    required
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  />
                </label>
                <label className="field-label">
                  Upload Product Image
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadProductImage(e.target.files?.[0])}
                  />
                </label>

                {uploadingImage && <p className="muted">Uploading image...</p>}

                <label className="field-label">
                  Image URL
                  <input
                    className="input"
                    required
                    value={form.image}
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                  />
                </label>

                {form.image && (
                  <img src={form.image} alt="Product preview" className="admin-preview" />
                )}

                <label className="field-label">
                  Sizes (comma separated)
                  <input
                    className="input"
                    value={form.sizeOptions}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, sizeOptions: e.target.value }))
                    }
                  />
                </label>
                <label className="field-label">
                  Tags (comma separated)
                  <input
                    className="input"
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  />
                </label>
                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                  />
                  Mark as featured
                </label>

                <div className="admin-btn-row">
                  <button type="submit" className="primary-btn" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => {
                        setEditingId("");
                        setForm(blankProduct);
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              <div className="panel admin-table-wrap">
                <h3>Product List</h3>
                <div className="admin-table">
                  {products.map((product) => (
                    <article key={product._id} className="admin-row">
                      <img src={product.image} alt={product.name} />
                      <div>
                        <strong>{product.name}</strong>
                        <p className="muted">
                          {product.category} | INR {product.price}
                        </p>
                      </div>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="tiny-btn"
                          onClick={() => onEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ghost-btn danger"
                          onClick={() => onDeleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="panel admin-table-wrap">
              <h3>Order Management</h3>
              <div className="admin-table">
                {orders.map((order) => (
                  <article key={order._id} className="admin-row order-admin-row">
                    <div>
                      <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                      <p className="muted">
                        {(order.user?.name || "User")} | {order.items.length} items | INR{" "}
                        {order.totalPrice.toFixed(2)}
                      </p>
                      <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                        Method: <strong>{order.paymentMethod}</strong>
                        {order.paymentResult?.transactionId && (
                          <> | Txn ID: <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 4px", borderRadius: "4px" }}>{order.paymentResult.transactionId}</code></>
                        )}
                      </p>
                    </div>
                    <div className="admin-actions">
                      <select
                        className="input"
                        value={order.status}
                        onChange={(e) => updateOrder(order._id, { status: e.target.value })}
                      >
                        <option>Processing</option>
                        <option>Packed</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                      </select>
                      <select
                        className="input"
                        value={order.paymentStatus || "Pending"}
                        onChange={(e) =>
                          updateOrder(order._id, { paymentStatus: e.target.value })
                        }
                      >
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Failed</option>
                      </select>
                      <button
                        type="button"
                        className="tiny-btn"
                        onClick={() => generateInvoicePDF(order)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                      >
                        <svg
                          width="12"
                          height="12"
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
                        PDF Bill
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {tab === "reports" && (
            <div className="panel reports-layout" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ margin: 0 }}>Business Profit & Loss Statement</h3>
                  <p className="muted" style={{ margin: "0.2rem 0 0 0", fontSize: "0.9rem" }}>
                    Real-time dynamic financial statement calculated based on {orders.length} active orders.
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => generateProfitLossPDF(stats, orders, costMargin, fixedExpenses)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <svg
                    width="16"
                    height="16"
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
                  Download Report (PDF)
                </button>
              </div>

              {/* Sliders and adjustment metrics */}
              <div className="reports-inputs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div className="field-label" style={{ background: "rgba(255,255,255,0.02)", padding: "1.2rem", borderRadius: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <span style={{ fontWeight: 600 }}>Product Cost Margin</span>
                    <span style={{ color: "var(--purple-glow)", fontWeight: 700 }}>{costMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={costMargin}
                    onChange={(e) => setCostMargin(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--purple)" }}
                  />
                  <span className="muted" style={{ fontSize: "0.78rem", marginTop: "0.4rem", display: "block" }}>
                    Wholesale cost margin to calculate Cost of Goods Sold (COGS).
                  </span>
                </div>

                <div className="field-label" style={{ background: "rgba(255,255,255,0.02)", padding: "1.2rem", borderRadius: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <span style={{ fontWeight: 600 }}>Fixed Operating Expenses</span>
                    <span style={{ color: "var(--purple-glow)", fontWeight: 700 }}>INR {fixedExpenses}</span>
                  </div>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    step="500"
                    value={fixedExpenses}
                    onChange={(e) => setFixedExpenses(Math.max(0, Number(e.target.value)))}
                    style={{ padding: "0.45rem 0.6rem" }}
                  />
                  <span className="muted" style={{ fontSize: "0.78rem", marginTop: "0.4rem", display: "block" }}>
                    Total rent, server costs, marketing, and employee payroll expenses.
                  </span>
                </div>
              </div>

              {/* Financial summary metrics */}
              <div className="admin-stats" style={{ margin: "0.5rem 0" }}>
                <article className="panel stat-card" style={{ borderLeft: "4px solid var(--success)" }}>
                  <span>Base Product Sales</span>
                  <strong>INR {finances.totalItemsPrice.toFixed(2)}</strong>
                </article>
                <article className="panel stat-card" style={{ borderLeft: "4px solid var(--danger)" }}>
                  <span>Cost of Goods Sold (COGS)</span>
                  <strong style={{ color: "#ff86a3" }}>INR {finances.cogs.toFixed(2)}</strong>
                </article>
                <article className="panel stat-card" style={{ borderLeft: "4px solid var(--danger)" }}>
                  <span>Tax Collected</span>
                  <strong style={{ color: "#ff86a3" }}>INR {finances.totalTax.toFixed(2)}</strong>
                </article>
                <article className="panel stat-card" style={{ borderLeft: `4px solid ${finances.isProfit ? "var(--success)" : "var(--danger)"}` }}>
                  <span>{finances.isProfit ? "Net Profit" : "Net Loss"}</span>
                  <strong style={{ color: finances.isProfit ? "#78f4ac" : "#ff86a3" }}>
                    INR {finances.netProfit.toFixed(2)}
                  </strong>
                </article>
              </div>

              {/* Printable Table Format Preview */}
              <div className="admin-table-wrap">
                <h4>Financial Preview Statement</h4>
                <div className="admin-table" style={{ marginTop: "0.8rem" }}>
                  <div className="admin-row" style={{ gridTemplateColumns: "2fr 1fr 1fr", fontWeight: 700, background: "rgba(141, 53, 255, 0.15)", borderColor: "var(--purple)" }}>
                    <div>Line Item / Category</div>
                    <div>Amount (INR)</div>
                    <div>% of Base Sales</div>
                  </div>
                  <div className="admin-row" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
                    <div>Product Sales (Revenue)</div>
                    <div style={{ color: "var(--success)" }}>+INR {finances.totalItemsPrice.toFixed(2)}</div>
                    <div>100.0%</div>
                  </div>
                  <div className="admin-row" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
                    <div>Cost of Goods Sold (COGS)</div>
                    <div style={{ color: "var(--danger)" }}>-INR {finances.cogs.toFixed(2)}</div>
                    <div>-{costMargin.toFixed(1)}%</div>
                  </div>
                  <div className="admin-row" style={{ gridTemplateColumns: "2fr 1fr 1fr", borderBottom: "2px solid var(--border)" }}>
                    <div>Gross Profit Margin</div>
                    <div style={{ fontWeight: 700 }}>INR {finances.grossProfit.toFixed(2)}</div>
                    <div>{((finances.grossProfit / (finances.totalItemsPrice || 1)) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="admin-row" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
                    <div>Tax Collected (Liabilities)</div>
                    <div style={{ color: "var(--danger)" }}>-INR {finances.totalTax.toFixed(2)}</div>
                    <div>-{((finances.totalTax / (finances.totalItemsPrice || 1)) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="admin-row" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
                    <div>Fixed Expenses (Operating Costs)</div>
                    <div style={{ color: "var(--danger)" }}>-INR {fixedExpenses.toFixed(2)}</div>
                    <div>-{((fixedExpenses / (finances.totalItemsPrice || 1)) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="admin-row" style={{ gridTemplateColumns: "2fr 1fr 1fr", background: "rgba(255,255,255,0.02)", borderColor: finances.isProfit ? "var(--success)" : "var(--danger)" }}>
                    <div style={{ fontWeight: 700 }}>{finances.isProfit ? "Net Profit" : "Net Loss"}</div>
                    <div style={{ fontWeight: 700, color: finances.isProfit ? "var(--success)" : "var(--danger)" }}>
                      INR {finances.netProfit.toFixed(2)}
                    </div>
                    <div style={{ fontWeight: 700, color: finances.isProfit ? "var(--success)" : "var(--danger)" }}>
                      {((finances.netProfit / (finances.totalItemsPrice || 1)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default AdminPage;
