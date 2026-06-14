/**
 * GoogleMap — reusable, no-API-key Google Maps embed.
 *
 * Props:
 *   query     {string}  Place name or "lat,lng" (default: the VitalPaws clinic)
 *   zoom      {number}  Map zoom (default 15)
 *   height    {string}  CSS height (default "320px")
 *   title     {string}  iframe title (a11y)
 *   className {string}  Extra class on the iframe
 */

// Vitalpaws Veterinary Clinic — resolved from the homepage "Find Us" link.
export const CLINIC_LOCATION = "-20.0948521,57.6355452";

const GoogleMap = ({
  query = CLINIC_LOCATION,
  zoom = 15,
  height = "320px",
  title = "Our location",
  className = "",
}) => (
  <iframe
    title={title}
    className={className}
    src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`}
    width="100%"
    height={height}
    style={{ border: 0, borderRadius: "14px", display: "block" }}
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    allowFullScreen
  />
);

export default GoogleMap;
