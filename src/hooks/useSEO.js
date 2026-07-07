import { useEffect } from "react";

const BRAND = "VitalPaws";
const SITE_TITLE = "VitalPaws — Veterinary Care & Pet Shop in Mauritius";
const DEFAULT_DESC =
  "VitalPaws offers veterinary care, grooming, boarding, and a full pet shop in Mauritius. Book a professional or shop for your pet online.";

export default function useSEO(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND}` : SITE_TITLE;
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", description || DEFAULT_DESC);
  }, [title, description]);
}
