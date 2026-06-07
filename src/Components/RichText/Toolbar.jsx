import { useCallback, useState } from "react";
import {
  MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS,
  MdFormatListBulleted, MdFormatListNumbered,
  MdFormatQuote, MdCode,
  MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify,
  MdHighlight, MdFormatClear, MdLink, MdLinkOff,
} from "react-icons/md";
import { TOOLBAR_GROUPS } from "./extensions";

/* ─── Primitive components ───────────────────────────────────────────── */

const Divider = () => <span className="rte-toolbar-divider" aria-hidden />;

const Btn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`rte-toolbar-btn ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}
    title={title}
    disabled={disabled}
    aria-pressed={active}
  >
    {children}
  </button>
);

/* ─── Link dialog ────────────────────────────────────────────────────── */

const LinkDialog = ({ onConfirm, onCancel, initial = "" }) => {
  const [url, setUrl] = useState(initial);
  return (
    <div className="rte-link-dialog">
      <input
        className="rte-link-input"
        type="url"
        placeholder="https://..."
        value={url}
        autoFocus
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onConfirm(url); }
          if (e.key === "Escape") onCancel();
        }}
      />
      <button type="button" className="rte-link-confirm" onMouseDown={(e) => { e.preventDefault(); onConfirm(url); }}>Set</button>
      <button type="button" className="rte-link-cancel"  onMouseDown={(e) => { e.preventDefault(); onCancel(); }}>✕</button>
    </div>
  );
};

/* ─── Main Toolbar ───────────────────────────────────────────────────── */

const Toolbar = ({ editor, preset = "standard" }) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const groups = TOOLBAR_GROUPS[preset] ?? TOOLBAR_GROUPS.standard;

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    setLinkDialogOpen(true);
  }, [editor]);

  const confirmLink = useCallback((url) => {
    setLinkDialogOpen(false);
    if (!editor) return;
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    const href = url.startsWith("http") ? url : `https://${url}`;
    editor.chain().focus().setLink({ href }).run();
  }, [editor]);

  const cancelLink = useCallback(() => setLinkDialogOpen(false), []);

  if (!editor) return null;

  return (
    <div className="rte-toolbar" role="toolbar" aria-label="Text formatting">

      {/* FORMAT group — bold, italic, underline, strike */}
      {groups.includes("format") && (
        <div className="rte-toolbar-group">
          <Btn title="Bold (Ctrl+B)"      active={editor.isActive("bold")}      onClick={() => editor.chain().focus().toggleBold().run()}>      <MdFormatBold /></Btn>
          <Btn title="Italic (Ctrl+I)"    active={editor.isActive("italic")}    onClick={() => editor.chain().focus().toggleItalic().run()}>    <MdFormatItalic /></Btn>
          <Btn title="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}> <MdFormatUnderlined /></Btn>
          {groups.includes("extras") && (
            <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><MdStrikethroughS /></Btn>
          )}
        </div>
      )}

      {groups.includes("format") && groups.includes("heading") && <Divider />}

      {/* HEADING group */}
      {groups.includes("heading") && (
        <div className="rte-toolbar-group">
          {[1, 2, 3].map((level) => (
            <Btn
              key={level}
              title={`Heading ${level}`}
              active={editor.isActive("heading", { level })}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            >
              <span className="rte-heading-label">H{level}</span>
            </Btn>
          ))}
        </div>
      )}

      {groups.includes("heading") && <Divider />}

      {/* LIST group */}
      {groups.includes("list") && (
        <div className="rte-toolbar-group">
          <Btn title="Bullet list"   active={editor.isActive("bulletList")}  onClick={() => editor.chain().focus().toggleBulletList().run()}>  <MdFormatListBulleted /></Btn>
          <Btn title="Ordered list"  active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}> <MdFormatListNumbered /></Btn>
        </div>
      )}

      {groups.includes("list") && groups.includes("extras") && <Divider />}

      {/* EXTRAS group — blockquote, inline code, link */}
      {groups.includes("extras") && (
        <div className="rte-toolbar-group">
          <Btn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><MdFormatQuote /></Btn>
          <Btn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><MdCode /></Btn>
          <Btn title="Add link"    active={editor.isActive("link")}      onClick={openLinkDialog}><MdLink /></Btn>
          {editor.isActive("link") && (
            <Btn title="Remove link" active={false} onClick={() => editor.chain().focus().unsetLink().run()}><MdLinkOff /></Btn>
          )}
        </div>
      )}

      {groups.includes("extras") && groups.includes("align") && <Divider />}

      {/* ALIGN group */}
      {groups.includes("align") && (
        <div className="rte-toolbar-group">
          <Btn title="Align left"    active={editor.isActive({ textAlign: "left" })}    onClick={() => editor.chain().focus().setTextAlign("left").run()}>    <MdFormatAlignLeft /></Btn>
          <Btn title="Align center"  active={editor.isActive({ textAlign: "center" })}  onClick={() => editor.chain().focus().setTextAlign("center").run()}>  <MdFormatAlignCenter /></Btn>
          <Btn title="Align right"   active={editor.isActive({ textAlign: "right" })}   onClick={() => editor.chain().focus().setTextAlign("right").run()}>   <MdFormatAlignRight /></Btn>
          <Btn title="Justify"       active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}> <MdFormatAlignJustify /></Btn>
        </div>
      )}

      {groups.includes("align") && groups.includes("highlight") && <Divider />}

      {/* HIGHLIGHT group */}
      {groups.includes("highlight") && (
        <div className="rte-toolbar-group">
          <Btn title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}><MdHighlight /></Btn>
        </div>
      )}

      {/* Always: clear formatting — right-aligned via flex margin */}
      <div className="rte-toolbar-group rte-toolbar-end">
        <Btn title="Clear formatting" active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}><MdFormatClear /></Btn>
      </div>

      {/* Link dialog overlay */}
      {linkDialogOpen && (
        <LinkDialog
          initial={editor.getAttributes("link").href ?? ""}
          onConfirm={confirmLink}
          onCancel={cancelLink}
        />
      )}
    </div>
  );
};

export default Toolbar;
