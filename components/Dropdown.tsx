"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "./Icon";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: IconName;
}

interface Position {
  left: number;
  top: number;
  width: number;
  placement: "down" | "up";
}

/**
 * Accessible listbox dropdown. The menu is portalled to <body> with fixed
 * positioning, so it floats on the page surface instead of being clipped by
 * whatever container the trigger lives in.
 */
export function Dropdown<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  id: string;
  label: string;
  value: T;
  options: ReadonlyArray<DropdownOption<T>>;
  onChange: (value: T) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<Position | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  const place = useCallback(() => {
    const r = trigger.current?.getBoundingClientRect();
    if (!r) return;
    const menuH = list.current?.offsetHeight ?? options.length * 60 + 12;
    const width = Math.max(r.width, 260);
    const spaceBelow = window.innerHeight - r.bottom;
    const up = spaceBelow < menuH + 16 && r.top > spaceBelow;
    setPos({
      width,
      left: Math.min(Math.max(8, r.left), window.innerWidth - width - 8),
      top: up ? r.top - menuH - 8 : r.bottom + 8,
      placement: up ? "up" : "down",
    });
  }, [options.length]);

  const openMenu = (index = selectedIndex) => {
    setActive(index);
    setOpen(true);
  };
  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  }, []);
  const choose = (index: number) => {
    onChange(options[index].value);
    close();
  };

  // Measure once the menu exists, then keep it pinned to the trigger.
  useLayoutEffect(() => {
    if (!open) return;
    place();
    list.current?.focus({ preventScroll: true });
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!trigger.current?.contains(t) && !list.current?.contains(t)) close(false);
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, place, close]);

  function onTriggerKey(e: React.KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openMenu(e.key === "ArrowUp" ? options.length - 1 : selectedIndex);
    }
  }

  function onListKey(e: React.KeyboardEvent) {
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive((i) => (i === last ? 0 : i + 1)); break;
      case "ArrowUp": e.preventDefault(); setActive((i) => (i === 0 ? last : i - 1)); break;
      case "Home": e.preventDefault(); setActive(0); break;
      case "End": e.preventDefault(); setActive(last); break;
      case "Enter":
      case " ": e.preventDefault(); choose(active); break;
      case "Escape": e.preventDefault(); close(); break;
      case "Tab": close(false); break;
    }
  }

  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        className={`dd-trigger ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${selected.label}`}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKey}
      >
        <span>{selected.label}</span>
        <Icon name="chevron" className="ico dd-chev" />
      </button>

      {open &&
        createPortal(
          <ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${listId}-${active}`}
            className="dd-menu"
            data-placement={pos?.placement ?? "down"}
            style={pos ? { left: pos.left, top: pos.top, width: pos.width } : { visibility: "hidden" }}
            onKeyDown={onListKey}
          >
            {options.map((o, i) => (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o.value === value}
                className={`dd-option${i === active ? " is-active" : ""}`}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
              >
                {o.icon && <span className="dd-ic"><Icon name={o.icon} /></span>}
                <span className="dd-text">
                  <b>{o.label}</b>
                  {o.hint && <small>{o.hint}</small>}
                </span>
                <Icon name="check" className="ico dd-check" />
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  );
}
