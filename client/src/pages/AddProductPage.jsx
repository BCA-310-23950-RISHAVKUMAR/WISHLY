import { useState } from "react";
import api, { getErrorMessage } from "../api/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddProductPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "10"
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.description || !formData.category) {
      toast.error("Please fill in all required text fields.");
      return;
    }
    
    if (!imageFile) {
      toast.error("Please select a product image.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create FormData object
      const data = new FormData();
      
      // 2. Append text fields
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("stock", formData.stock);
      
      // 3. Append the image file
      data.append("image", imageFile);

      // 4. Send POST request
      await api.post("/products", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product added successfully!");
      navigate("/admin"); // Redirect back to admin dashboard
    } catch (err) {
      const errorMsg = getErrorMessage(err, "Failed to add product");
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <p className="eyebrow">ADMIN AREA</p>
          <h2>Add New Product</h2>
        </div>
      </div>

      <div className="admin-layout" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <form className="panel form-grid" onSubmit={handleSubmit}>
          
          <label className="field-label">
            Product Name *
            <input
              className="input"
              type="text"
              name="name"
              placeholder="E.g., Vintage Graphic T-Shirt"
              value={formData.name}
              onChange={handleInputChange}
            />
          </label>

          <label className="field-label">
            Price (INR) *
            <input
              className="input"
              type="number"
              name="price"
              placeholder="E.g., 999"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
            />
          </label>

          <label className="field-label">
            Description *
            <textarea
              className="input"
              name="description"
              rows="4"
              placeholder="Detailed description of the product..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </label>

          <label className="field-label">
            Category *
            <select
              className="input"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="" disabled>Select a category</option>
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Accessories">Accessories</option>
              <option value="Footwear">Footwear</option>
            </select>
          </label>
          
          <label className="field-label">
            Stock Quantity
            <input
              className="input"
              type="number"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
            />
          </label>

          <label className="field-label">
            Product Image *
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>

          {imagePreview && (
            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.5rem" }}>Image Preview:</p>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "300px", 
                  objectFit: "contain",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)"
                }} 
              />
            </div>
          )}

          <div className="admin-btn-row" style={{ marginTop: "1.5rem" }}>
            <button 
              type="submit" 
              className="primary-btn" 
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
