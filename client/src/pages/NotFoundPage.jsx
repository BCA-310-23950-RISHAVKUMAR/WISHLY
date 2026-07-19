import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <section className="container section">
    <div className="empty-box">
      <h2>404</h2>
      <p>Page not found.</p>
      <Link to="/" className="primary-btn">
        Go Home
      </Link>
    </div>
  </section>
);

export default NotFoundPage;
