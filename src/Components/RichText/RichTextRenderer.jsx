/**
 * RichTextRenderer — safely renders HTML stored by RichTextEditor
 *
 * Uses DOMPurify to strip any malicious HTML before rendering.
 * Always use this component (never dangerouslySetInnerHTML directly)
 * whenever displaying user-authored rich text.
 *
 * Props:
 *   content     {string}   HTML string from the editor / API
 *   className   {string}   Extra class on the wrapper
 *   emptyText   {string}   Shown when content is empty  default: ""
 *   prose       {bool}     Apply full prose typography class  default: true
 */

import DOMPurify from "dompurify";
import "./RichTextRenderer.css";

// Configure DOMPurify once — allow common safe tags, strip scripts/iframes
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "u", "s", "mark",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "code", "pre",
    "a", "hr", "img",
    "span", "div",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "style", "src", "alt", "width", "height"],
  ALLOW_DATA_ATTR: false,
};

const sanitize = (html) => {
  if (!html || typeof html !== "string") return "";
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
};

const RichTextRenderer = ({
  content = "",
  className = "",
  emptyText = "",
  prose = true,
}) => {
  const clean = sanitize(content);

  if (!clean) {
    return emptyText
      ? <p className={`rte-renderer-empty ${className}`}>{emptyText}</p>
      : null;
  }

  return (
    <div
      className={`rte-renderer ${prose ? "rte-prose" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default RichTextRenderer;
