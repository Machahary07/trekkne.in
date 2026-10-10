"use client";

import { useState } from "react";
import { Eyes } from "./Eyes";
import { useSiteState, type JoinRole } from "./SiteState";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s-]{10,15}$/;

export function JoinCta() {
  const { joinRole, setJoinRole } = useSiteState();
  const [contact, setContact] = useState("");
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = contact.trim();
    if (!EMAIL.test(v) && !PHONE.test(v)) {
      setMsg("Enter a valid email or a 10-digit phone number.");
      return;
    }
    // TODO: insert into a Supabase `waitlist` table once the backend is connected.
    setMsg("Thanks! The waitlist isn’t live yet, so we haven’t saved your details. Check back soon.");
    setContact("");
  }

  return (
    <section id="join" aria-labelledby="join-h">
      <div className="wrap">
        <div className="cta">
          <div>
            <h2 id="join-h">Know before <span>you go.</span></h2>
            <p>
              Join the early list for the Trekne app. Tell us whether you’re travelling, guiding or hosting, and we’ll
              reach out when the pilot opens in your area.
            </p>
            <form className="join" noValidate onSubmit={onSubmit}>
              <div className="join-row">
                <label htmlFor="join-email" className="sr-only">Email or phone</label>
                <input
                  id="join-email"
                  name="contact"
                  type="text"
                  inputMode="email"
                  placeholder="Email or phone number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
                <label htmlFor="join-role" className="sr-only">I am</label>
                <select id="join-role" name="role" value={joinRole} onChange={(e) => setJoinRole(e.target.value as JoinRole)}>
                  <option value="traveller">I’m travelling</option>
                  <option value="ranger">I’m a guide / Ranger</option>
                  <option value="business">I run a business</option>
                </select>
                <button className="btn btn-ink" type="submit">Join the list</button>
              </div>
              <p className="join-msg" aria-live="polite">{msg}</p>
            </form>
          </div>
          <div className="cta-face" aria-hidden="true">
            <span className="blob" />
            <Eyes />
          </div>
        </div>
      </div>
    </section>
  );
}
