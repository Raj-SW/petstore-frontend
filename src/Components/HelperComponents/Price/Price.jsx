/**
 * Price — currency-aware price display component.
 *
 * Always receives `amount` in MUR (base currency).
 * Converts and formats using CurrencyContext.
 *
 * Props:
 *   amount   {number}  Price in MUR
 *   className {string} Optional CSS class on the wrapping <span>
 *   showMur  {bool}    Also show the MUR amount in parentheses when a
 *                      foreign currency is selected. Useful at checkout.
 *
 * Examples:
 *   <Price amount={product.price} />
 *   <Price amount={total} className="checkout-total" showMur />
 */
import { useCurrency } from '../../../context/CurrencyContext';

const Price = ({ amount, className = '', showMur = false }) => {
  const { formatPrice, selectedCurrency } = useCurrency();

  if (amount === null || amount === undefined) {
    return <span className={className}>—</span>;
  }

  return (
    <span className={className}>
      {formatPrice(amount)}
      {showMur && selectedCurrency !== 'MUR' && (
        <span style={{ fontSize: '0.8em', opacity: 0.6, marginLeft: '0.4rem' }}>
          (Rs {Math.round(amount).toLocaleString()})
        </span>
      )}
    </span>
  );
};

export default Price;
