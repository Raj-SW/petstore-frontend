/**
 * RichText Extension Presets
 *
 * Three preset tiers — pick one when using <RichTextEditor preset="...">
 *
 *  "minimal"  — Bold, Italic, Underline, Bullet list only
 *               Good for: short descriptions, comments
 *
 *  "standard" — Everything in minimal + Headings, Ordered list,
 *               Blockquote, Link, Strike, Code
 *               Good for: product descriptions, bios
 *
 *  "full"     — Everything in standard + Text alignment, Highlight, Code block
 *               Good for: blog posts, rich content pages
 */

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

// Shared link config
const linkConfig = Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    rel: "noopener noreferrer",
    target: "_blank",
    class: "rte-link",
  },
});

// Shared text-align config
const textAlignConfig = TextAlign.configure({
  types: ["heading", "paragraph"],
  defaultAlignment: "left",
});

/**
 * Build extension list from preset name + options
 * @param {"minimal"|"standard"|"full"} preset
 * @param {{ placeholder?: string, maxLength?: number }} opts
 */
export function buildExtensions(preset = "standard", opts = {}) {
  const shared = [
    ...(opts.placeholder
      ? [Placeholder.configure({ placeholder: opts.placeholder })]
      : []),
    ...(opts.maxLength
      ? [CharacterCount.configure({ limit: opts.maxLength })]
      : []),
  ];

  switch (preset) {
    case "minimal":
      return [
        StarterKit.configure({
          heading: false,
          blockquote: false,
          codeBlock: false,
          code: false,
          strike: false,
          horizontalRule: false,
        }),
        Underline,
        ...shared,
      ];

    case "full":
      return [
        StarterKit,
        Underline,
        linkConfig,
        textAlignConfig,
        Highlight.configure({ multicolor: false }),
        ...shared,
      ];

    case "standard":
    default:
      return [
        StarterKit.configure({ codeBlock: false }),
        Underline,
        linkConfig,
        ...shared,
      ];
  }
}

/** Toolbar button groups per preset — used by Toolbar.jsx */
export const TOOLBAR_GROUPS = {
  minimal: ["format", "list"],
  standard: ["format", "heading", "list", "extras"],
  full: ["format", "heading", "list", "extras", "align", "highlight"],
};
