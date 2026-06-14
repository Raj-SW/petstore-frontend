import Price from "./Price";
import "./ProductPrice.css";

/**
 * Product price display: when on sale, shows the sale price with the original
 * struck-through beside it; otherwise just the price. Currency formatting is
 * delegated to <Price>.
 */
const ProductPrice = ({ price, salePrice, isOnSaleNow, className = "" }) => {
  if (isOnSaleNow && salePrice != null) {
    return (
      <span className={`product-price ${className}`}>
        <Price amount={salePrice} className="product-price-sale" />
        <Price amount={price} className="product-price-original" />
      </span>
    );
  }
  return <Price amount={price} className={className} />;
};

export default ProductPrice;
