"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Check, RotateCcw, RotateCw, Undo2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/feedback";

// Crop and rotate a menu photo before it is read (F26). A straight, tight photo
// of the dish list is read far better than a tilted one with the table around
// it. Everything happens in the browser; only the edited photo is uploaded.

/** Longest side of the saved photo — the OCR service scales larger ones down anyway. */
const MAX_OUTPUT_SIDE = 2400;
/** Smallest crop, as a share of the photo's width / height. */
const MIN_CROP = 0.1;

type Rotation = 0 | 90 | 180 | 270;
/** Crop box in 0–1 units of the rotated photo. */
interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}
type Handle = "move" | "nw" | "ne" | "sw" | "se";

const FULL: Crop = { x: 0, y: 0, w: 1, h: 1 };

function rotatedSize(img: HTMLImageElement, rotation: Rotation) {
  const sideways = rotation === 90 || rotation === 270;
  return sideways ? { w: img.naturalHeight, h: img.naturalWidth } : { w: img.naturalWidth, h: img.naturalHeight };
}

/** Draws the whole photo, rotated, onto a canvas `scale` times its natural size. */
function drawRotated(canvas: HTMLCanvasElement, img: HTMLImageElement, rotation: Rotation, scale: number) {
  const { w, h } = rotatedSize(img, rotation);
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  const iw = img.naturalWidth * scale;
  const ih = img.naturalHeight * scale;
  ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function moveCrop(start: Crop, handle: Handle, dx: number, dy: number): Crop {
  if (handle === "move") {
    return { ...start, x: clamp(start.x + dx, 0, 1 - start.w), y: clamp(start.y + dy, 0, 1 - start.h) };
  }
  let { x, y, w, h } = start;
  if (handle === "nw" || handle === "sw") {
    const nx = clamp(x + dx, 0, x + w - MIN_CROP);
    w += x - nx;
    x = nx;
  } else {
    w = clamp(w + dx, MIN_CROP, 1 - x);
  }
  if (handle === "nw" || handle === "ne") {
    const ny = clamp(y + dy, 0, y + h - MIN_CROP);
    h += y - ny;
    y = ny;
  } else {
    h = clamp(h + dy, MIN_CROP, 1 - y);
  }
  return { x, y, w, h };
}

interface PhotoEditorProps {
  /** Object URL of the photo to edit; null closes the editor. */
  src: string | null;
  fileName: string;
  onSave: (file: File) => void;
  onClose: () => void;
}

export function PhotoEditor({ src, fileName, onSave, onClose }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [crop, setCrop] = useState<Crop>(FULL);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const drag = useRef<{ handle: Handle; startX: number; startY: number; start: Crop } | null>(null);

  // Load the photo whenever the editor opens on a new one.
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      setImg(image);
      setRotation(0);
      setCrop(FULL);
      setError("");
    };
    image.onerror = () => !cancelled && setError("This photo can't be opened for editing.");
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Preview: the rotated photo, small enough to fit the sheet.
  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const { w, h } = rotatedSize(img, rotation);
    const maxW = Math.min(window.innerWidth - 40, 640);
    const maxH = window.innerHeight * 0.5;
    drawRotated(canvasRef.current, img, rotation, Math.min(1, maxW / w, maxH / h));
  }, [img, rotation]);

  function rotate(by: 90 | -90) {
    setRotation((r) => ((r + by + 360) % 360) as Rotation);
    setCrop(FULL);
  }

  /** Starts a drag of the box or one corner (`data-handle`); a corner stops the box from also moving. */
  function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const handle = e.currentTarget.dataset.handle as Handle;
    drag.current = { handle, startX: e.clientX, startY: e.clientY, start: crop };
  }

  function onPointerMove(e: ReactPointerEvent) {
    const d = drag.current;
    const frame = frameRef.current?.getBoundingClientRect();
    if (!d || !frame) return;
    setCrop(moveCrop(d.start, d.handle, (e.clientX - d.startX) / frame.width, (e.clientY - d.startY) / frame.height));
  }

  function onPointerUp() {
    drag.current = null;
  }

  async function save() {
    if (!img) return;
    setSaving(true);
    try {
      const { w, h } = rotatedSize(img, rotation);
      const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(w * crop.w, h * crop.h));
      const full = document.createElement("canvas");
      drawRotated(full, img, rotation, scale);

      const out = document.createElement("canvas");
      out.width = Math.max(1, Math.round(full.width * crop.w));
      out.height = Math.max(1, Math.round(full.height * crop.h));
      out
        .getContext("2d")
        ?.drawImage(full, full.width * crop.x, full.height * crop.y, out.width, out.height, 0, 0, out.width, out.height);

      const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) throw new Error("toBlob failed");
      const base = fileName.replace(/\.[^.]+$/, "");
      onSave(new File([blob], `${base}-edited.jpg`, { type: "image/jpeg" }));
    } catch {
      setError("Couldn't save the edited photo. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const unchanged = rotation === 0 && crop === FULL;
  // Corner handles sit just inside the box so the frame can clip the dimmed area.
  const handleClass = "absolute h-7 w-7 touch-none rounded-full border-2 border-white bg-brand shadow-md";

  return (
    <BottomSheet open={src !== null} onClose={onClose} label="Crop and rotate photo">
      <h2 className="mb-1 text-lg font-black text-ink">Crop &amp; rotate</h2>
      <p className="mb-4 text-xs text-muted">
        Turn the photo so the text is upright, then drag the corners around the dish list. Tighter photos are read better.
      </p>

      <div className="mb-4 flex justify-center">
        <div
          ref={frameRef}
          className="relative touch-none overflow-hidden rounded-lg select-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <canvas ref={canvasRef} className="block max-w-full rounded-lg" aria-label="Menu photo preview" />
          {img && (
            <div
              className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
              style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }}
              data-handle="move"
              onPointerDown={onPointerDown}
            >
              {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                <span
                  key={corner}
                  aria-hidden
                  className={handleClass}
                  style={{
                    left: corner.endsWith("w") ? 0 : "100%",
                    top: corner.startsWith("n") ? 0 : "100%",
                    transform: `translate(${corner.endsWith("w") ? "0" : "-100%"}, ${corner.startsWith("n") ? "0" : "-100%"})`,
                  }}
                  data-handle={corner}
                  onPointerDown={onPointerDown}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" onClick={() => rotate(-90)} disabled={!img}>
          <RotateCcw size={15} aria-hidden />
          Left
        </Button>
        <Button variant="outline" size="sm" onClick={() => rotate(90)} disabled={!img}>
          <RotateCw size={15} aria-hidden />
          Right
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRotation(0);
            setCrop(FULL);
          }}
          disabled={!img || unchanged}
        >
          <Undo2 size={15} aria-hidden />
          Reset
        </Button>
      </div>

      <FormError className="mb-3">{error}</FormError>

      <div className="flex gap-2">
        <Button variant="ghost" size="md" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          size="md"
          onClick={save}
          disabled={!img || unchanged}
          loading={saving}
          loadingLabel="Saving…"
          className="flex-1 shadow-none"
        >
          <Check size={16} strokeWidth={3} aria-hidden />
          Use this photo
        </Button>
      </div>
    </BottomSheet>
  );
}
