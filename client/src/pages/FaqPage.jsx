const faqItems = [
  {
    q: "How fast is delivery?",
    a: "Most metro orders are dispatched within 24 hours. Typical delivery time is 2-5 days."
  },
  {
    q: "Do you offer online payment?",
    a: "Yes. Wishly supports Razorpay and Stripe test-ready online payment in checkout."
  },
  {
    q: "Can I track my orders?",
    a: "Yes. Go to My Orders to see status updates from Processing to Delivered."
  },
  {
    q: "Who can use the admin dashboard?",
    a: "Only admin users can access the dashboard to manage products and order statuses."
  },
  {
    q: "Is this a men-only store?",
    a: "Yes. Wishly is focused on men-only fashion and accessories."
  }
];

const FaqPage = () => (
  <section className="container section">
    <div className="section-head">
      <div>
        <p className="eyebrow">FAQ</p>
        <h2>Frequently Asked Questions</h2>
      </div>
    </div>

    <div className="faq-list">
      {faqItems.map((item) => (
        <details key={item.q} className="panel faq-item reveal">
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  </section>
);

export default FaqPage;
