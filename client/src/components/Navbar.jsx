import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="nav-wrap">
      <nav className="navbar container">
        <Link to="/" className="brand">
          WISHLY
        </Link>

        <div className="nav-links">
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
          <NavLink to="/products" className="nav-link">
            Shop
          </NavLink>
          <NavLink to="/about" className="nav-link">
            About
          </NavLink>
          <NavLink to="/contact" className="nav-link">
            Contact
          </NavLink>
          <NavLink to="/faq" className="nav-link">
            Help
          </NavLink>
          <NavLink to="/orders" className="nav-link">
            Orders
          </NavLink>
          {user?.isAdmin && (
            <NavLink to="/admin" className="nav-link admin-link">
              Admin
            </NavLink>
          )}
        </div>

        <div className="nav-actions">
          <NavLink to="/cart" className="cart-link">
            Cart <span className="badge">{itemCount}</span>
          </NavLink>

          {isLoggedIn ? (
            <button className="ghost-btn" onClick={logout} type="button">
              {user?.name?.split(" ")[0]} | Logout
            </button>
          ) : (
            <NavLink to="/login" className="ghost-btn">
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
