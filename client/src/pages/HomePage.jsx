import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get("/products/featured");
        setFeatured(data);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load featured products"));
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      <Hero />

      <section className="container mini-cards reveal">
        <article className="reveal">
          <h3>Fast Delivery</h3>
          <p>Ships in 24 hours across major cities. Free shipping on orders above INR 2500.</p>
        </article>
        <article className="reveal">
          <h3>Premium Quality</h3>
          <p>Only men&apos;s curated products with lasting fabric and high comfort standards.</p>
        </article>
        <article className="reveal">
          <h3>Secure Checkout</h3>
          <p>Simple checkout with COD, Razorpay, and Stripe-ready payment flow.</p>
        </article>
      </section>

      <section id="featured" className="container section">
        <div className="section-head">
          <div>
            <p className="eyebrow">FEATURED DROP</p>
            <h2>Top Picks For Men</h2>
          </div>
          <Link to="/products" className="text-link">
            View All
          </Link>
        </div>

        {loading && (
          <div className="product-grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        )}
        {error && <p className="error-text">{error}</p>}

        <div className="product-grid reveal">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="container lookbook section reveal">
        <div className="lookbook-text">
          <p className="eyebrow">WISHLY LOOKBOOK</p>
          <h2>From Street Nights To Formal Lights</h2>
          <p>
            Inspired by premium fashion stores but designed for a bold men&apos;s-only identity.
            Clean silhouettes, dark luxury palette, and fast shopping flow.
          </p>
          <Link to="/products" className="primary-btn">
            Build Your Outfit
          </Link>
        </div>
        <div className="lookbook-image">
          <img
            src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80"
            alt="Wishly men's fashion"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
