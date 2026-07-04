import { useRef, useState, useCallback } from "react";
import { FiUpload, FiX, FiStar } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../../../core/api/apiClient";
import "./ImageManager.css";

/**
 * Shared admin image manager — the canonical image system for products,
 * variants, feedback and tips. Images upload immediately to `uploadUrl`
 * (returning `{ url, publicId }`); the parent form holds the ordered refs
 * via `value`/`onChange` and submits them as JSON. Index 0 = primary/cover.
 *
 * Props:
 *   value      [{ url, publicId }]   ordered image refs (controlled)
 *   onChange   (next) => void        called with the new ordered array
 *   uploadUrl  string                e.g. "/products/upload-image"
 *   max        number                max images (default 10)
 *   onError    (msg) => void         optional toast hook
 *   label      string               optional heading
 */
const MAX_MB = 15;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const Thumb = ({ img, index, onRemove, onMakeCover }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: img.publicId });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className={`im-thumb${index === 0 ? " im-thumb--cover" : ""}`}>
      <img src={img.url} alt={`Uploaded thumbnail ${index + 1}`} className="im-thumb-img" />

      <button type="button" className="im-thumb-drag" {...attributes} {...listeners} title="Drag to reorder" aria-label="Drag to reorder">
        <MdDragIndicator />
      </button>

      {index === 0 ? (
        <span className="im-cover-badge"><FiStar size={10} /> Cover</span>
      ) : (
        <button type="button" className="im-make-cover" onClick={() => onMakeCover(index)} title="Make cover">
          Make cover
        </button>
      )}

      <button type="button" className="im-thumb-remove" onClick={() => onRemove(index)} aria-label="Remove image">
        <FiX size={12} />
      </button>
    </div>
  );
};

const filterValidFiles = (files, fail) => {
  const valid = [];
  for (const f of files) {
    if (!f.type.startsWith("image/")) { fail(`"${f.name}" is not an image.`); continue; }
    if (f.size > MAX_BYTES) { fail(`"${f.name}" exceeds the ${MAX_MB} MB limit.`); continue; }
    valid.push(f);
  }
  return valid;
};

const ImageManager = ({ value = [], onChange, uploadUrl, max = 10, onError, label }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fail = useCallback((msg) => { if (onError) onError(msg); }, [onError]);

  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const room = max - value.length;
    if (room <= 0) { fail(`You can attach at most ${max} image${max === 1 ? "" : "s"}.`); return; }
    const toUpload = files.slice(0, room);

    const valid = filterValidFiles(toUpload, fail);
    if (!valid.length) return;

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of valid) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await api.post(uploadUrl, fd);
        const ref = res?.data?.data;
        if (ref?.url && ref?.publicId) uploaded.push({ url: ref.url, publicId: ref.publicId });
      }
      if (uploaded.length) onChange([...value, ...uploaded]);
    } catch (err) {
      fail(err?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }, [value, max, uploadUrl, onChange, fail]);

  const onDragEnd = useCallback(({ active, over }) => {
    if (over && active.id !== over.id) {
      const oldIdx = value.findIndex((i) => i.publicId === active.id);
      const newIdx = value.findIndex((i) => i.publicId === over.id);
      if (oldIdx !== -1 && newIdx !== -1) onChange(arrayMove(value, oldIdx, newIdx));
    }
  }, [value, onChange]);

  const removeAt = (i) => onChange(value.filter((_, j) => j !== i));
  const makeCover = (i) => onChange(arrayMove(value, i, 0));

  const full = value.length >= max;

  return (
    <div className="im-root">
      {label && <span className="im-label">{label}</span>}

      {value.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={value.map((i) => i.publicId)} strategy={rectSortingStrategy}>
            <div className="im-grid">
              {value.map((img, i) => (
                <Thumb key={img.publicId || i} img={img} index={i} onRemove={removeAt} onMakeCover={makeCover} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!full && (
        <button
          type="button"
          className={`im-dropzone${uploading ? " im-dropzone--busy" : ""}`}
          aria-label="Upload images"
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (!uploading) handleFiles(e.dataTransfer.files); }}
        >
          <FiUpload size={20} className="im-dropzone-icon" />
          <p className="im-dropzone-text">
            {uploading ? "Uploading…" : <><strong>Click to upload</strong> or drag &amp; drop</>}
          </p>
          <p className="im-dropzone-hint">
            PNG, JPG, WEBP · max {MAX_MB} MB · {value.length}/{max}
          </p>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        style={{ display: "none" }}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
};

export default ImageManager;
