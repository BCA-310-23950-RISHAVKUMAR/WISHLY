import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (nameError) return;
    const result = await register(form);
    if (result.ok) {
      navigate("/products", { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <section className="container section">
      <div className="auth-box panel">
        <h2>Create Account</h2>
        <p className="muted">Join Wishly and place your first order.</p>

        <form className="form-grid" onSubmit={onSubmit}>
          <label className="field-label">
            Name
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => {
                const val = e.target.value;
                if (val && !/^[A-Za-z\s]+$/.test(val)) {
                  setNameError("Name can only contain alphabets and spaces.");
                } else {
                  setNameError("");
                }
                setForm((prev) => ({ ...prev, name: val }));
              }}
            />
          </label>
          {nameError && (
            <p className="error-text" style={{ marginTop: "0.2rem", marginBottom: "10px", fontSize: "0.85rem" }}>
              {nameError}
            </p>
          )}
          <label className="field-label">
            Email
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Password
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                minLength={6}
                required
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                style={{ paddingRight: "3rem", width: "100%" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.6
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="primary-btn full" disabled={loading} type="submit">
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
