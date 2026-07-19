import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay" />
      <div className="hero-content container">
        <p className="eyebrow">MEN ONLY COLLECTION</p>
        <h1>Style Built In Black. Powered By Purple.</h1>
        <p>
          Wishly is a premium men&apos;s fashion destination with fast delivery, sharp cuts, and
          effortless street-luxury vibes.
        </p>
        <div className="hero-actions">
          <Link to="/products" className="primary-btn">
            Shop New Arrivals
          </Link>
          <a className="secondary-btn" href="#featured">
            Explore Featured
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
