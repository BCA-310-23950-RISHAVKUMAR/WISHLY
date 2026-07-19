import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from || "/products";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <section className="container section">
      <div className="auth-box panel">
        <h2>Login</h2>
        <p className="muted">Welcome back to Wishly.</p>

        <form className="form-grid" onSubmit={onSubmit}>
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
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="muted">
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
