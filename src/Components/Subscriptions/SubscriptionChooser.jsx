import { computeSavings, isIntervalValid } from "../../utils/subscriptionPricing";
import "./SubscriptionChooser.css";

const defaultFormat = (n) => `Rs ${Math.round(n).toLocaleString()}`;

const SubscriptionChooser = ({
  basePrice,
  discountPercent,
  mode,
  onModeChange,
  intervalCount,
  intervalUnit,
  onIntervalCountChange,
  onIntervalUnitChange,
  formatAmount = defaultFormat,
  oneTimeLabel = "One-Time Purchase",
}) => {
  const { base, discounted, save } = computeSavings(basePrice, discountPercent);
  const subscribeActive = mode === "subscribe";
  const intervalOk = isIntervalValid(intervalUnit, intervalCount);

  return (
    <div className="subchooser" role="radiogroup" aria-label="Purchase option">
      {/* One-time card */}
      <button
        type="button"
        role="radio"
        aria-checked={mode === "onetime"}
        aria-label={oneTimeLabel}
        className={`subchooser-card${mode === "onetime" ? " subchooser-card--active subchooser-card--onetime" : ""}`}
        onClick={() => onModeChange("onetime")}
      >
        <span className="subchooser-dot" aria-hidden="true" />
        <span className="subchooser-card-body">
          <span className="subchooser-card-title">{oneTimeLabel}</span>
          <span className="subchooser-price-onetime">{formatAmount(base)}</span>
        </span>
      </button>

      {/* Subscribe card */}
      <button
        type="button"
        role="radio"
        aria-checked={subscribeActive}
        aria-label="Subscribe & Save"
        className={`subchooser-card${subscribeActive ? " subchooser-card--active subchooser-card--subscribe" : ""}`}
        onClick={() => onModeChange("subscribe")}
      >
        <span className="subchooser-dot" aria-hidden="true" />
        <span className="subchooser-card-body">
          <span className="subchooser-card-titlerow">
            <span className="subchooser-card-title">Subscribe &amp; Save</span>
            <span className="subchooser-pill">Save {discountPercent}%</span>
          </span>
          <span className="subchooser-pricerow">
            <span className="subchooser-price-base">{formatAmount(base)}</span>
            <span className="subchooser-price-discounted">{formatAmount(discounted)}</span>
          </span>
          <span className="subchooser-save">(You save {formatAmount(save)}!)</span>
        </span>
      </button>

      {/* Conditional frequency dropdown */}
      {subscribeActive && (
        <div className="subchooser-freq">
          <label className="subchooser-freq-label" htmlFor="subchooser-freq-select">
            Delivery frequency
          </label>
          <div className="subchooser-freq-row">
            <span>Every</span>
            <input
              type="number"
              min="1"
              value={intervalCount}
              onChange={(e) => onIntervalCountChange(e.target.value)}
              className="subchooser-freq-count"
              aria-label="Interval count"
            />
            <select
              id="subchooser-freq-select"
              value={intervalUnit}
              onChange={(e) => onIntervalUnitChange(e.target.value)}
            >
              <option value="day">day(s)</option>
              <option value="week">week(s)</option>
            </select>
          </div>
          {!intervalOk && (
            <p className="subchooser-warn">Minimum interval is 7 days.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionChooser;
