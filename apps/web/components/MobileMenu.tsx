"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { useSiteState } from "./SiteState";

/** Hamburger + slide-down sheet for tablet and phone widths (hidden on desktop via CSS). */
export function MobileMenu({ links }: { links: ReadonlyArray<readonly [href: string, label: string]> }) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(72);
  const button = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLElement>(null);
  const { setJoinRole } = useSiteState();

  const toggle = () => {
    if (!open) setTop(button.current?.closest(".site-head")?.getBoundingClientRect().bottom ?? 72);
    setOpen((o) => !o);
  };
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    sheet.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Growing past the breakpoint closes the sheet.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1181px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        ref={button}
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={toggle}
      >
        <Icon name={open ? "close" : "menu"} />
      </button>

      {open &&
        createPortal(
          <div className="sheet-root" style={{ "--sheet-top": `${top}px` } as React.CSSProperties}>
            <div className="sheet-backdrop" onClick={close} aria-hidden="true" />
            <nav ref={sheet} id="mobile-menu" className="sheet" aria-label="Menu">
              <ul className="sheet-links">
                {links.map(([href, label]) => (
                  <li key={href}>
                    <a href={href} onClick={close}>
                      {label}
                      <Icon name="arrow" />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="sheet-ctas">
                <a className="btn btn-ghost" href="#rangers" onClick={close}>
                  Become a Ranger
                </a>
                <a className="btn btn-ink" href="#join" onClick={() => { setJoinRole("traveller"); close(); }}>
                  Get the app
                </a>
              </div>
              <p className="sheet-note"><Icon name="pin" />Pilot starting in Meghalaya</p>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
