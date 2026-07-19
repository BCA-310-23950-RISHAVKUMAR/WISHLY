import { Link } from "react-router-dom";

const AnnouncementBar = () => (
  <div className="announcement">
    <div className="container announcement-inner">
      <p>
        New: Admin dashboard + online payment test mode added. Flat INR 250 off on orders above
        INR 4999.
      </p>
      <Link to="/products">Shop Now</Link>
    </div>
  </div>
);

export default AnnouncementBar;
