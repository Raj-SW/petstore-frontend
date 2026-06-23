// Cover images are { url, publicId } (Epic 8) but legacy/unmigrated data may
// still be a bare URL string. Resolve either shape to a URL (or "").
export function coverUrl(cover) {
  if (!cover) return "";
  if (typeof cover === "string") return cover;
  return cover.url || "";
}
