"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: IconName;
}

/**
 * Accessible listbox dropdown. The menu is anchored to its trigger and always
 * opens directly below it, moving with the page like any other element.
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
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  }, []);
  const openMenu = (index = selectedIndex) => {
    setActive(index);
    setOpen(true);
  };
  const choose = (index: number) => {
    onChange(options[index].value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
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
    <div ref={root} className={`dd ${className}`}>
      <button
        ref={trigger}
        id={id}
        type="button"
        className="dd-trigger"
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

      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${listId}-${active}`}
          className="dd-menu"
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
        </ul>
      )}
    </div>
  );
}
