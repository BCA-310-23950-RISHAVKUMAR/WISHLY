import { Link } from "react-router-dom";

const AboutPage = () => (
  <section className="container section">
    <div className="panel page-hero reveal">
      <p className="eyebrow">ABOUT WISHLY</p>
      <h2>Built For Men. Styled For Impact.</h2>
      <p>
        Wishly is a men-only fashion e-commerce concept designed for modern street-luxury style.
        This project combines premium visuals, fast browsing, and a full stack architecture made for
        real-world scaling.
      </p>
      <p>
        The platform includes secure auth, MongoDB product management, online payment-ready checkout,
        and admin controls for inventory and orders.
      </p>
      <Link to="/products" className="primary-btn">
        Explore Collection
      </Link>
    </div>

    <div className="info-grid reveal">
      <article className="panel">
        <h3>Our Vision</h3>
        <p>
          Deliver a premium shopping experience for men with bold aesthetics, fast UX, and easy
          operations.
        </p>
      </article>
      <article className="panel">
        <h3>Our Design Language</h3>
        <p>
          Black-forward identity, purple accents, expressive motion, and clean product storytelling.
        </p>
      </article>
      <article className="panel">
        <h3>Our Stack</h3>
        <p>React + Node.js + Express + MongoDB with secure JWT auth and optimized API responses.</p>
      </article>
    </div>
  </section>
);

export default AboutPage;
