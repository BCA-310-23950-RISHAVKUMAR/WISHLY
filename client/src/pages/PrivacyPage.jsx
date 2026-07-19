const PrivacyPage = () => (
  <section className="container section">
    <div className="panel policy-page reveal">
      <p className="eyebrow">PRIVACY</p>
      <h2>Privacy Policy</h2>
      <p>
        Wishly collects only essential user information such as name, email, and shipping details
        required to process orders and improve experience.
      </p>
      <p>
        Payment credentials are never stored directly in this demo app. Online payment integration is
        test-mode ready for Stripe and Razorpay.
      </p>
      <p>
        We use authentication tokens to keep user sessions secure. You can request account removal by
        contacting support.
      </p>
      <h3>Data We Use</h3>
      <ul className="policy-list">
        <li>Account details for login and profile identity</li>
        <li>Order and address details for shipment handling</li>
        <li>Basic analytics for performance and UX improvements</li>
      </ul>
      <p>By using Wishly, you agree to this policy for the college project demo environment.</p>
    </div>
  </section>
);

export default PrivacyPage;
