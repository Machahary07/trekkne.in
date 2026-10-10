"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/**
 * Password input with a show / hide toggle. On the split-screen sign-in pages it also drives the mascot
 * (via `data-eyes` on `.auth`): eyes shut while you type, and one eye peeks while the password is shown.
 */
export function PasswordField({ autoComplete }: { autoComplete: "current-password" | "new-password" }) {
  const [shown, setShown] = useState(false);
  const [typing, setTyping] = useState(false);
  const field = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    const auth = field.current?.closest(".auth");
    if (!auth) return;
    const mood = shown ? "peek" : typing ? "closed" : null;
    if (mood) auth.setAttribute("data-eyes", mood);
    else auth.removeAttribute("data-eyes");
    return () => auth.removeAttribute("data-eyes");
  }, [shown, typing]);

  return (
    <label className="field" ref={field}>
      <span>Password</span>
      <span className="pw">
        <input
          className="input"
          name="password"
          type={shown ? "text" : "password"}
          required
          minLength={8}
          autoComplete={autoComplete}
          onFocus={() => setTyping(true)}
          onBlur={() => setTyping(false)}
        />
        <button
          type="button"
          className="pw-toggle"
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          // Keep focus (and the caret) in the input while toggling.
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => setShown((s) => !s)}
        >
          <Icon name={shown ? "eyeoff" : "eye"} />
        </button>
      </span>
    </label>
  );
}
