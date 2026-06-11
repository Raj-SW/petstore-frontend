import { FiHeart, FiArrowRight } from "react-icons/fi";

const AdvertBanner = ({ advert }) => {
  if (!advert) return null;
  const external = advert.link.startsWith("http");
  return (
    <a
      href={advert.link}
      className="pct-banner-ad"
      target={external ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      <div className="pct-banner-left">
        <div className="pct-banner-icon">
          {advert.image
            ? <img src={advert.image} alt="" loading="lazy" />
            : <FiHeart size={20} aria-hidden="true" />}
        </div>
        <div>
          <p className="pct-banner-tag">Sponsored</p>
          <p className="pct-banner-title">{advert.title}</p>
        </div>
      </div>
      <span className="pct-banner-cta">
        Shop now <FiArrowRight size={13} aria-hidden="true" />
      </span>
    </a>
  );
};

export default AdvertBanner;
