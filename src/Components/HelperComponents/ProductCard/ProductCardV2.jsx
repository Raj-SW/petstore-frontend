import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import ProductPrice from "../Price/ProductPrice";
import SaleBadge from "../SaleBadge/SaleBadge";
import "./ProductCardV2.css";

/** Strip HTML tags so rich-text descriptions render as plain text in the card. */
const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.trim() ?? "";
};

/**
 * Resolve a product image URL from whichever shape the API returns:
 *   - Cloudinary object array : images[0].url
 *   - Plain string array      : images[0]  (string)
 *   - Legacy single field     : imageUrl
 */
export const resolveProductImage = (p) =>
  p?.images?.[0]?.url ||
  (typeof p?.images?.[0] === "string" ? p.images[0] : null) ||
  p?.imageUrl ||
  null;

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0ebe4'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='56' fill='%23c9baa8'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E";

const ProductCardV2 = ({
  id, imageUrl, title, price, description,
  salePrice = null, isOnSaleNow = false, discountPercentLabel = 0, effectivePrice,
  variantsView = null,
}) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showCartToast } = useToast();
  const [qty, setQty] = useState(1);

  const hasVariants = Array.isArray(variantsView) && variantsView.length > 0;
  const fromPrice = hasVariants
    ? Math.min(...variantsView.map((v) => v.effectivePrice ?? v.price))
    : null;

  const dec = (e) => {
    e.stopPropagation();
    setQty((q) => Math.max(1, q - 1));
  };
  const inc = (e) => {
    e.stopPropagation();
    setQty((q) => q + 1);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem({ id, name: title, price: effectivePrice ?? price, image: imageUrl }, qty);
    showCartToast("add", title);
  };

  return (
    <motion.div
      className="pcv2-card"
      onClick={() => navigate(`/product/${id}`)}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: "easeOut" } }}
    >
      <div className="pcv2-img-wrap">
        <img
          src={imageUrl || PLACEHOLDER_IMG}
          alt={title}
          className="pcv2-img"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
        />
        {isOnSaleNow && (
          <SaleBadge percent={discountPercentLabel} className="pcv2-sale-badge" />
        )}
      </div>

      <div className="pcv2-info">
        <p className="pcv2-name">{title}</p>
        <p className="pcv2-desc">
          {stripHtml(description) || "Premium quality product for your pet."}
        </p>
        <div className="pcv2-bottom-row">
          {hasVariants ? (
            <span className="pcv2-price pcv2-price-from">
              From <ProductPrice price={fromPrice} isOnSaleNow={false} className="pcv2-price" />
            </span>
          ) : (
            <ProductPrice
              price={price}
              salePrice={salePrice}
              isOnSaleNow={isOnSaleNow}
              className="pcv2-price"
            />
          )}
          <div className="pcv2-actions">
            {hasVariants ? (
              <button
                className="pcv2-select-btn"
                onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`); }}
                aria-label="Select options"
              >
                Select options
              </button>
            ) : (
              <>
                <div className="pcv2-qty" role="presentation">
                  <button
                    type="button"
                    className="pcv2-qty-btn"
                    onClick={dec}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    <FaMinus size={9} />
                  </button>
                  <span className="pcv2-qty-val">{qty}</span>
                  <button
                    type="button"
                    className="pcv2-qty-btn"
                    onClick={inc}
                    aria-label="Increase quantity"
                  >
                    <FaPlus size={9} />
                  </button>
                </div>
                <button
                  className="pcv2-cart-btn"
                  onClick={handleAddToCart}
                  aria-label="Add to cart"
                >
                  <FaShoppingCart size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardV2;
