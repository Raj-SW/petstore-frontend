/**
 * Pet Travel / Relocation landing page content.
 * All copy lives here so the page reads from a single source of truth
 * (easier to update and to localise later). Icon values are string keys
 * resolved to components by <PtIcon name="…" /> in components/PtIcon.jsx.
 */

// Single source of truth for the number lives in AppointmentModal.
export { WHATSAPP_NUMBER as PT_WHATSAPP_NUMBER } from "../../Components/AppointmentModal/AppointmentModal";
export const PT_WHATSAPP_MESSAGE =
  "Hi, I'd like help relocating my pet abroad.";
export const PT_CLINIC_MAP_URL = "https://maps.app.goo.gl/YQRTJz6vFe3K9Z6UA";
/* Point this at a real PDF in /public when the checklist is ready. */
export const PT_CHECKLIST_PDF_URL = "";

export const ptHero = {
  badge: "Pet Relocation",
  titleLines: ["Moving Abroad", "with Your Pet?"],
  tagline: "We make it simple, safe and stress-free.",
  body: "From documentation and veterinary examinations to travel preparation and export guidance, VitalPaws handles every detail so your pet can travel with comfort and care.",
  features: [
    { icon: "guidance", title: "Expert Guidance", desc: "Every step of the way" },
    { icon: "compliance", title: "100% Compliance", desc: "with destination rules" },
    { icon: "plane", title: "Safe & Comfortable", desc: "travel planning" },
    { icon: "heart", title: "Peace of Mind", desc: "for you and your pet" },
  ],
  trust: {
    rating: 5,
    label: "Trusted by Pet Parents",
    stat: "100+ Successful Relocations",
  },
};

export const ptProcess = {
  label: "Our Relocation Process",
  title: "A Smooth Journey, Step by Step",
  subtitle:
    "We take care of the complex so you can focus on your new adventure together.",
  steps: [
    { icon: "consultation", title: "Travel Consultation", desc: "We learn about your travel plans and your pet's needs." },
    { icon: "clipboard", title: "Destination Requirements", desc: "We check the specific import rules for your destination." },
    { icon: "stethoscope", title: "Veterinary Examination", desc: "Full health check by our veterinarian to ensure your pet is fit to travel." },
    { icon: "lab", title: "Laboratory Tests (If Required)", desc: "Blood tests and other tests as required by the destination country." },
    { icon: "certificate", title: "Health Certificate", desc: "Official certificate issued and endorsed by the authorities." },
    { icon: "folder", title: "Export Documentation", desc: "We prepare and verify all export documents for travel." },
    { icon: "plane", title: "Travel Preparation", desc: "Crate checks, travel tips and final guidance before departure." },
    { icon: "smile", title: "Arrival Support", desc: "We guide you on what to expect upon arrival at your destination." },
  ],
};

export const ptDestinations = {
  title: "Popular Destinations",
  desc: "We regularly assist pets traveling to:",
  moreLabel: "…and many more",
  countries: [
    { code: "AU", flag: "🇦🇺", name: "Australia" },
    { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
    { code: "CA", flag: "🇨🇦", name: "Canada" },
    { code: "NZ", flag: "🇳🇿", name: "New Zealand" },
    { code: "FR", flag: "🇫🇷", name: "France" },
    { code: "DE", flag: "🇩🇪", name: "Germany" },
    { code: "ZA", flag: "🇿🇦", name: "South Africa" },
    { code: "US", flag: "🇺🇸", name: "United States" },
  ],
};

export const ptRulesCard = {
  title: "Every Country Has Different Rules.",
  subtitle: "We know them all.",
  body: "Our team stays up-to-date with the latest import regulations so your pet meets all requirements.",
  cta: "Check Your Destination",
};

export const ptChecklistCard = {
  title: "Pet Travel Checklist",
  desc: "Download our free checklist to prepare for your pet's trip.",
  cta: "Download PDF",
};

export const ptTrustBar = [
  { icon: "crate", title: "IATA-Compliant Crates", desc: "Safe & airline approved" },
  { icon: "shield", title: "Government Endorsed", desc: "Documents handled correctly" },
  { icon: "comfort", title: "Comfort First", desc: "Your pet's well-being comes first" },
  { icon: "support", title: "Ongoing Support", desc: "We're with you all the way" },
];

export const ptFinalCta = {
  title: "Ready to start your pet's journey?",
  subtitle: "Book a consultation with our pet travel experts today.",
  cta: "Book Now",
};
