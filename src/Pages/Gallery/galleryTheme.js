// Category styling + small helpers for the Gallery pages.
// Colors derive from the VitalPaws palette (forest, amber, warm tints).

export const GALLERY_CATEGORIES = [
  { key: "event", label: "Event", color: "#1f6b48", tint: "#e3f1ea" },
  { key: "community", label: "Community", color: "#b45309", tint: "#fdebd2" },
  { key: "award", label: "Award", color: "#9a6b1f", tint: "#f7ecd6" },
  { key: "announcement", label: "Announcement", color: "#2f6f9e", tint: "#e1eef6" },
  { key: "behind_the_scenes", label: "Behind the Scenes", color: "#7e4a7e", tint: "#f1e6f1" },
];

const FALLBACK = { key: "", label: "Post", color: "#001C10", tint: "#ece3d8" };

export function getCategoryTheme(key) {
  return GALLERY_CATEGORIES.find((c) => c.key === key) || FALLBACK;
}

export function formatEventDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
