import { useState } from "react";

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [sent, setSent] = useState(false);
  const [nameError, setNameError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (nameError) return;
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section className="container section">
      <div className="section-head">
        <div>
          <p className="eyebrow">CONTACT</p>
          <h2>Reach Team Wishly</h2>
        </div>
      </div>

      <div className="contact-layout">
        <form className="panel form-grid reveal" onSubmit={onSubmit}>
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
            <p className="error-text" style={{ marginTop: "0.2rem", marginBottom: "10px", fontSize: "0.85rem", color: "var(--color-error, #f44336)" }}>
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
            Subject
            <input
              className="input"
              required
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Message
            <textarea
              className="input textarea"
              required
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            />
          </label>
          {sent && <p className="success-text">Message sent. Our team will contact you soon.</p>}
          <button className="primary-btn" type="submit">
            Send Message
          </button>
        </form>

        <aside className="panel reveal">
          <h3>Support Details</h3>
          <p>Email: rishavkumar181815@gmail.com</p>
          <p>Phone: +91 7780024121</p>
          <p>Hours: Mon-Sat, 10 AM - 7 PM</p>
          <p>
            For order help, include your order ID from <strong>My Orders</strong>.
          </p>
        </aside>
      </div>
    </section>
  );
};

export default ContactPage;
