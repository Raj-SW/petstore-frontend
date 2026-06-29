/**
 * RichTextEditor — reusable TipTap-powered rich text editor
 *
 * Props:
 *   value        {string}   HTML string (controlled)
 *   onChange     {fn}       (html: string) => void
 *   preset       {string}   "minimal" | "standard" | "full"   default: "standard"
 *   placeholder  {string}   Placeholder text shown when empty
 *   maxLength    {number}   Character limit (shows counter, blocks typing at limit)
 *   showCharCount{bool}     Show character counter even without maxLength
 *   label        {string}   Label above the editor
 *   error        {string}   Validation error message (red border + message)
 *   readOnly     {bool}     Render in view-only mode (no toolbar, no cursor)
 *   minHeight    {string}   CSS min-height of the content area  default: "160px"
 *   className    {string}   Extra class on the wrapper
 *   autofocus    {bool}     Focus editor on mount
 */

import { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { buildExtensions } from "./extensions";
import Toolbar from "./Toolbar";
import "./RichTextEditor.css";

const RichTextEditor = ({
  value = "",
  onChange,
  preset = "standard",
  placeholder = "Start writing…",
  maxLength,
  showCharCount = false,
  label,
  error,
  readOnly = false,
  minHeight = "160px",
  className = "",
  autofocus = false,
  onImageUpload,
}) => {
  const extensions = buildExtensions(preset, { placeholder, maxLength });

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    autofocus,
    onUpdate({ editor }) {
      if (!onChange) return;
      // Return empty string when editor has no meaningful content
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
  });

  // Sync external value changes (e.g. form reset, edit mode load)
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) {
      // setContent without emitting an update (prevents infinite loop)
      editor.commands.setContent(value ?? "", false);
    }
  }, [value, editor]);

  // Sync readOnly prop
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [readOnly, editor]);

  const getCharCount = useCallback(() => {
    if (!editor) return 0;
    return editor.storage.characterCount?.characters?.() ?? 0;
  }, [editor]);

  const charCount = getCharCount();
  const isOverLimit = maxLength && charCount > maxLength;
  const showCounter = showCharCount || Boolean(maxLength);

  return (
    <div className={`rte-wrapper ${error ? "rte-has-error" : ""} ${readOnly ? "rte-read-only" : ""} ${className}`}>
      {label && <p className="rte-label">{label}</p>}

      <div className="rte-container">
        {!readOnly && <Toolbar editor={editor} preset={preset} onImageUpload={onImageUpload} />}

        <EditorContent
          editor={editor}
          className="rte-content"
          style={{ "--rte-min-height": minHeight }}
        />
      </div>

      <div className="rte-footer">
        {error && <span className="rte-error">{error}</span>}
        {showCounter && !error && (
          <span className={`rte-char-count ${isOverLimit ? "rte-over-limit" : ""}`}>
            {charCount}{maxLength ? ` / ${maxLength}` : ""} characters
          </span>
        )}
        {!error && !showCounter && <span />}
      </div>
    </div>
  );
};

export default RichTextEditor;
