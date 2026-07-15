import { Link } from "react-router-dom";
import { FaPaw, FaHome, FaShoppingBag } from "react-icons/fa";
import "./NotFoundPage.css";

/**
 * Branded 404 — the catch-all route. Without it, unknown URLs rendered
 * React Router's raw developer error screen with no navbar or styling.
 */
const NotFoundPage = () => (
  <main className="nf-page">
    <div className="nf-card">
      <FaPaw className="nf-icon" aria-hidden="true" />
      <p className="nf-code">404</p>
      <h1 className="nf-title">This page has wandered off</h1>
      <p className="nf-text">
        Like a curious pup, the page you&apos;re looking for slipped its leash.
        Let&apos;s get you back on track.
      </p>
      <div className="nf-actions">
        <Link to="/home" className="nf-btn nf-btn--primary">
          <FaHome size={14} /> Go Home
        </Link>
        <Link to="/petshop" className="nf-btn nf-btn--outline">
          <FaShoppingBag size={14} /> Browse the Shop
        </Link>
      </div>
    </div>
  </main>
);

export default NotFoundPage;
