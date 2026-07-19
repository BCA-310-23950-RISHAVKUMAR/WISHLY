import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";

const categories = [
  "All",
  "Tops",
  "Outerwear",
  "Bottoms",
  "Footwear",
  "Formal",
  "Accessories",
  "Fragrance",
  "Mens Wear"
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = searchParams.get("category") || "All";
  const query = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (query.trim()) params.search = query.trim();
        if (category !== "All") params.category = category;
        if (sort) params.sort = sort;

        const { data } = await api.get("/products", { params });
        setProducts(data);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load products"));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, query, sort]);

  const totalText = useMemo(() => `${products.length} product${products.length === 1 ? "" : "s"}`, [products.length]);

  return (
    <section className="container section">
      <div className="section-head">
        <div>
          <p className="eyebrow">SHOP</p>
          <h2>Men&apos;s Collection</h2>
        </div>
      </div>

      <div className="filters">
        <input
          className="input"
          value={query}
          onChange={(e) => {
            const next = new URLSearchParams(searchParams);
            if (e.target.value) next.set("q", e.target.value);
            else next.delete("q");
            setSearchParams(next, { replace: true });
          }}
          placeholder="Search product, category, vibe..."
        />

        <select
          className="input"
          value={category}
          onChange={(e) => {
            const next = new URLSearchParams(searchParams);
            if (e.target.value === "All") next.delete("category");
            else next.set("category", e.target.value);
            setSearchParams(next, { replace: true });
          }}
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <select
          className="input"
          value={sort}
          onChange={(e) => {
            const next = new URLSearchParams(searchParams);
            if (e.target.value) next.set("sort", e.target.value);
            else next.delete("sort");
            setSearchParams(next, { replace: true });
          }}
        >
          <option value="">Featured</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Best Rated</option>
        </select>
      </div>

      <p className="muted">{totalText}</p>

      {loading && (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}
      {error && <p className="error-text">{error}</p>}

      <div className="product-grid reveal">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductsPage;
