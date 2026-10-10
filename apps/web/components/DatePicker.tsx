"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { addDays } from "@/lib/trip";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const utc = (iso: string) => new Date(iso + "T00:00:00Z");
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => utc(iso).toLocaleDateString("en-IN", { timeZone: "UTC", ...o });
const monthOf = (iso: string) => iso.slice(0, 7) + "-01";
const addMonths = (first: string, n: number) => {
  const d = utc(first);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
};

/** The 6×7 grid of ISO dates (Monday first) that shows the month starting on `first`. */
function grid(first: string) {
  const lead = (utc(first).getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => addDays(first, i - lead));
}

const GAP = 10;

/**
 * Pill-shaped start-date trigger with a month calendar. The calendar is portalled to <body> (the hero card clips
 * its overflow) and placed below the pill, or above it when there isn't room, in page coordinates so it scrolls with it.
 * `span` tints the following days so the whole trip shows. Arrow keys move by day/week, PageUp/PageDown by month.
 */
export function DatePicker({ label, value, min, span = 1, onChange, variant = "hero" }: {
  label: string;
  value: string;
  min: string;
  span?: number;
  onChange: (iso: string) => void;
  /** "hero": white pill on the orange hero. "field": theme-coloured form field (planner). */
  variant?: "hero" | "field";
}) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(value);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);
  const titleId = useId();
  const view = monthOf(focus || value || min);
  const end = value ? addDays(value, span - 1) : "";

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!root.current?.contains(t) && !pop.current?.contains(t)) close(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Place the calendar once it has rendered and its size is known; re-place on resize.
  useLayoutEffect(() => {
    if (!open) return setPos(null);
    const place = () => {
      const r = trigger.current!.getBoundingClientRect();
      const { offsetWidth: w, offsetHeight: h } = pop.current!;
      const up = innerHeight - r.bottom < h + GAP && r.top > innerHeight - r.bottom;
      const gutter = 12;
      const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, gutter), document.documentElement.clientWidth - w - gutter);
      setPos({ top: scrollY + (up ? r.top - h - GAP : r.bottom + GAP), left: scrollX + left, up });
    };
    place();
    addEventListener("resize", place);
    return () => removeEventListener("resize", place);
  }, [open]);

  // Keep keyboard focus on the focused day as it moves (including across months).
  useEffect(() => {
    if (open) gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${focus}"]`)?.focus({ preventScroll: true });
  }, [open, focus]);

  function move(to: string) {
    setFocus(to < min ? min : to);
  }

  function onKey(e: React.KeyboardEvent) {
    const step: Record<string, () => string> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      PageUp: () => addMonths(focus, -1),
      PageDown: () => addMonths(focus, 1),
    };
    if (step[e.key]) {
      e.preventDefault();
      move(step[e.key]());
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  function pick(iso: string) {
    onChange(iso);
    close();
  }

  return (
    <div className="cal-dd" ref={root}>
      <button
        ref={trigger}
        type="button"
        className={variant === "hero" ? "trip-pill trip-date" : "date-field"}
        aria-label={`${label}: ${value ? fmt(value, { weekday: "long", day: "numeric", month: "long" }) : "not set"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setFocus(value || min);
          setOpen((o) => !o);
        }}
      >
        <Icon name="calendar" />
        {variant === "hero" && <span className="trip-k">{label}</span>}
        <b>{value ? fmt(value, { weekday: "short", day: "numeric", month: "short" }) : "Pick a date"}</b>
        <Icon name="chevron" />
      </button>

      {open && createPortal(
        <div
          ref={pop}
          className="cal"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          onKeyDown={onKey}
          data-up={pos?.up || undefined}
          style={pos ? { top: pos.top, left: pos.left } : { visibility: "hidden", top: 0, left: 0 }}
        >
          <div className="cal-head">
            <button type="button" aria-label="Previous month" disabled={view <= monthOf(min)} onClick={() => move(addMonths(view, -1))}>
              <Icon name="chevronRight" className="ico cal-prev" />
            </button>
            <b id={titleId} aria-live="polite">{fmt(view, { month: "long", year: "numeric" })}</b>
            <button type="button" aria-label="Next month" onClick={() => move(addMonths(view, 1))}>
              <Icon name="chevronRight" />
            </button>
          </div>
          <div className="cal-grid" role="grid" ref={gridRef}>
            <div role="row" className="cal-row">
              {WEEKDAYS.map((d) => <span key={d} role="columnheader" className="cal-wd">{d}</span>)}
            </div>
            {Array.from({ length: 6 }, (_, w) => (
              <div role="row" className="cal-row" key={w}>
                {grid(view).slice(w * 7, w * 7 + 7).map((iso) => {
                  const out = iso.slice(0, 7) !== view.slice(0, 7);
                  const past = iso < min;
                  const inTrip = value && iso >= value && iso <= end;
                  return (
                    <span role="gridcell" key={iso} aria-selected={iso === value}>
                      <button
                        type="button"
                        data-iso={iso}
                        className="cal-day"
                        data-out={out || undefined}
                        data-today={iso === min || undefined}
                        data-trip={inTrip ? (iso === value ? (iso === end ? "only" : "start") : iso === end ? "end" : "mid") : undefined}
                        tabIndex={iso === focus ? 0 : -1}
                        disabled={past}
                        aria-label={fmt(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        onClick={() => pick(iso)}
                      >
                        {Number(iso.slice(8))}
                      </button>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          {span > 1 && value && (
            <p className="cal-foot">
              <i />{span}-day trip: {fmt(value, { day: "numeric", month: "short" })} – {fmt(end, { day: "numeric", month: "short" })}
            </p>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
