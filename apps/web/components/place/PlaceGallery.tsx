"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";
import type { PlacePhoto } from "@/lib/photos";

/**
 * Photo mosaic for a place page (one large photo, four small) that opens a full-screen viewer.
 * On phones the mosaic becomes a swipeable strip. Every photo's credit and licence is shown in the viewer.
 */
export function PlaceGallery({ name, photos }: { name: string; photos: PlacePhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const strip = useRef<HTMLDivElement>(null);

  const show = (i: number, from: HTMLElement) => {
    opener.current = from;
    setOpen(i);
  };
  const step = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + photos.length) % photos.length)), [photos.length]);
  const hide = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (open == null) return;
    close.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, hide, step]);

  // Keep the current thumbnail in view in the viewer's strip.
  useEffect(() => {
    if (open != null) strip.current?.querySelector<HTMLElement>(`[data-i="${open}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [open]);

  // Swipe left/right in the viewer.
  const touch = useRef<number | null>(null);

  if (!photos.length) return null;
  const tiles = photos.slice(0, 5);
  const cur = open == null ? null : photos[open];

  return (
    <>
      <div className="pg-mosaic" data-count={tiles.length}>
        {tiles.map((p, i) => (
          <button key={p.src} type="button" className="pg-tile" onClick={(e) => show(i, e.currentTarget)} aria-label={`Open photo ${i + 1} of ${photos.length}: ${p.alt}`}>
            <img src={p.src} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" />
          </button>
        ))}
        <button type="button" className="pg-all" onClick={(e) => show(0, e.currentTarget)}>
          <Icon name="camera" />View all {photos.length} photos
        </button>
      </div>

      {cur && open != null && (
        <div className="pg-viewer" role="dialog" aria-modal="true" aria-label={`${name} photos`}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current == null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          <div className="pg-viewer-top">
            <span className="mono">{open + 1} / {photos.length}</span>
            <b>{name}</b>
            <button ref={close} type="button" className="pg-round" aria-label="Close photos" onClick={hide}><Icon name="close" /></button>
          </div>
          <div className="pg-stage">
            <button type="button" className="pg-round pg-prev" aria-label="Previous photo" onClick={() => step(-1)}><Icon name="chevronRight" /></button>
            <figure key={cur.src}>
              <img src={cur.src} alt={cur.alt} />
              <figcaption>
                <span>{cur.alt}</span>
                <small>
                  Photo: <a href={cur.sourceUrl} target="_blank" rel="noreferrer">{cur.credit}</a>
                  {cur.licenseUrl ? <> · <a href={cur.licenseUrl} target="_blank" rel="noreferrer">{cur.license}</a></> : <> · {cur.license}</>}
                  {" · Wikimedia Commons"}
                </small>
              </figcaption>
            </figure>
            <button type="button" className="pg-round pg-next" aria-label="Next photo" onClick={() => step(1)}><Icon name="chevronRight" /></button>
          </div>
          <div className="pg-thumbs" ref={strip}>
            {photos.map((p, i) => (
              <button key={p.src} type="button" data-i={i} aria-current={i === open || undefined} aria-label={`Photo ${i + 1}: ${p.alt}`} onClick={() => setOpen(i)}>
                <img src={p.src} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
