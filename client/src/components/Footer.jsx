import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <div>
        <h4>Wishly</h4>
        <p>Men&apos;s premium e-commerce built with speed, style, and confidence.</p>
      </div>
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/privacy">Privacy</Link>
      </div>
      <div className="footer-meta">
        <span>Support: rishavkumar181815@gmail.com | +91 7780024121</span>
        <span>Made for College Project Demo</span>
      </div>
    </div>
  </footer>
);

export default Footer;
