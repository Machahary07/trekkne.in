"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: IconName;
  /** Small coloured dot before the label (a level colour, e.g. risk). */
  dot?: "good" | "warn" | "high" | "none";
  /** Extra facts shown as small chips (grid layout only). */
  meta?: string[];
  /** Grid layout only: a photo filling the option card, or a flat brand colour when there's no photo. */
  image?: string | null;
  tone?: "green" | "yellow" | "blue" | "orange";
  disabled?: boolean;
}

/**
 * Accessible listbox dropdown: the site's replacement for native <select>. The menu is anchored to its trigger
 * and always opens directly below it, moving with the page like any other element.
 * With `placeholder` and an empty `value` it works as a picker ("+ Add a place…") that shows the placeholder.
 * Type a letter to jump to the next matching option.
 * `layout="grid"` lays the options out as small cards in columns; the menu then stretches across the nearest
 * positioned ancestor and arrow keys move in two dimensions.
 */
export function Dropdown<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  className = "",
  placeholder,
  layout = "list",
}: {
  id: string;
  label: string;
  value: T | "";
  options: ReadonlyArray<DropdownOption<T>>;
  onChange: (value: T) => void;
  className?: string;
  placeholder?: string;
  layout?: "list" | "grid";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const found = options.findIndex((o) => o.value === value);
  const selectedIndex = Math.max(0, found);
  const selected = found >= 0 ? options[found] : null;
  const typed = useRef({ text: "", at: 0 });

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  }, []);
  const openMenu = (index = selectedIndex) => {
    setActive(index);
    setOpen(true);
  };
  const choose = (index: number) => {
    if (options[index].disabled) return;
    onChange(options[index].value);
    close();
  };

  // Keep the active option scrolled into view in long lists.
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  /** Columns currently rendered by the grid menu (it reflows with the container width). */
  const cols = () => (list.current ? getComputedStyle(list.current).gridTemplateColumns.split(" ").length : 1);

  /** Type-ahead: letters typed within a second build a prefix to match against labels. */
  function typeahead(key: string) {
    const now = Date.now();
    const t = typed.current;
    t.text = (now - t.at > 1000 ? "" : t.text) + key.toLowerCase();
    t.at = now;
    const start = t.text.length === 1 ? active + 1 : active;
    for (let k = 0; k < options.length; k++) {
      const i = (start + k) % options.length;
      if (!options[i].disabled && options[i].label.toLowerCase().startsWith(t.text)) return setActive(i);
    }
  }

  useEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    // Scroll just enough that the whole menu is visible (the planner's grid menu can run past the bottom of the screen).
    // Measure after the opening animation, which starts the menu slightly smaller and higher.
    const reveal = () => list.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const settle = setTimeout(reveal, 240);
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => {
      clearTimeout(settle);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  function onTriggerKey(e: React.KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openMenu(e.key === "ArrowUp" ? options.length - 1 : selectedIndex);
    }
  }

  function onListKey(e: React.KeyboardEvent) {
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive((i) => (layout === "grid" ? Math.min(last, i + cols()) : i === last ? 0 : i + 1)); break;
      case "ArrowUp": e.preventDefault(); setActive((i) => (layout === "grid" ? Math.max(0, i - cols()) : i === 0 ? last : i - 1)); break;
      case "ArrowRight": if (layout === "grid") { e.preventDefault(); setActive((i) => Math.min(last, i + 1)); } break;
      case "ArrowLeft": if (layout === "grid") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); } break;
      case "Home": e.preventDefault(); setActive(0); break;
      case "End": e.preventDefault(); setActive(last); break;
      case "Enter":
      case " ": e.preventDefault(); choose(active); break;
      case "Escape": e.preventDefault(); close(); break;
      case "Tab": close(false); break;
      default: if (e.key.length === 1 && /\S/.test(e.key)) typeahead(e.key);
    }
  }

  return (
    <div ref={root} className={`dd ${className}`}>
      <button
        ref={trigger}
        id={id}
        type="button"
        className="dd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={selected ? `${label}: ${selected.label}` : label}
        data-empty={selected ? undefined : true}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKey}
      >
        <span>{selected?.label ?? placeholder ?? "Choose…"}</span>
        <Icon name="chevron" className="ico dd-chev" />
      </button>

      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${listId}-${active}`}
          className={`dd-menu${layout === "grid" ? " dd-grid" : ""}`}
          onKeyDown={onListKey}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              data-i={i}
              data-img={(layout === "grid" && o.image) || undefined}
              data-tone={(layout === "grid" && !o.image && o.tone) || undefined}
              style={layout === "grid" && o.image ? ({ "--img": `url("${o.image}")` } as React.CSSProperties) : undefined}
              className={`dd-option${i === active ? " is-active" : ""}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(i)}
            >
              {o.icon && <span className="dd-ic"><Icon name={o.icon} /></span>}
              {o.dot && <span className={`dd-dot l-${o.dot}`} aria-hidden="true" />}
              <span className="dd-text">
                <b>{o.label}</b>
                {o.hint && <small>{o.hint}</small>}
                {layout === "grid" && o.meta && o.meta.length > 0 && (
                  <span className="dd-meta">{o.meta.map((m) => <span key={m}>{m}</span>)}</span>
                )}
              </span>
              <Icon name="check" className="ico dd-check" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
