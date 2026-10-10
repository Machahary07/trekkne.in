"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "./Icon";
import { Dropdown, type DropdownOption } from "./Dropdown";

export type BusinessKind = "homestay" | "shop" | "guide" | "other";

const KINDS: ReadonlyArray<DropdownOption<BusinessKind>> = [
  { value: "homestay", label: "Homestay", hint: "Rooms with a local family", icon: "home" },
  { value: "shop", label: "Local shop or maker", hint: "Market stall, crafts, produce", icon: "store" },
  { value: "guide", label: "Guide or tour operator", hint: "Treks, boats, day trips", icon: "backpack" },
  { value: "other", label: "Something else", hint: "Café, transport, rentals…", icon: "plus" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s-]{10,15}$/;

/** Waitlist for businesses ahead of Homestays and Shop: name, business, and an email, a phone or both. */
export function BusinessWaitlist({ kind: initial = "homestay", title, text }: { kind?: BusinessKind; title: string; text: string }) {
  const [kind, setKind] = useState<BusinessKind>(initial);
  const [form, setForm] = useState({ name: "", business: "", email: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = form.name.trim();
    const business = form.business.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    if (name.length < 2) return setMsg("Add your name.");
    if (business.length < 2) return setMsg("Add your business name.");
    if (!email && !phone) return setMsg("Add an email or a phone number, or both.");
    if (email && !EMAIL.test(email)) return setMsg("That email doesn’t look right.");
    if (phone && !PHONE.test(phone)) return setMsg("Enter a 10-digit phone number.");
    setMsg("Saving…");
    const { error } = await supabaseBrowser().from("waitlist").insert({
      role: "business", kind, name, business, email: email || null, phone: phone || null, contact: email || phone,
    });
    if (error) return setMsg("Sorry, that didn’t save. Please try again in a moment.");
    setDone(true);
    setMsg(`You’re on the list, ${name.split(" ")[0]}. We’ll get in touch before listings open.`);
  }

  return (
    <section id="list" aria-labelledby="list-h">
      <div className="wrap">
        <div className="lw">
          <div className="lw-copy">
            <span className="eyebrow">Business waitlist</span>
            <h2 id="list-h">{title}</h2>
            <p>{text}</p>
            <ul>
              <li><Icon name="chat" />Email, phone or both, whatever suits you</li>
              <li><Icon name="check" />No payment, no commitment</li>
              <li><Icon name="shield" />Only used to contact you about Trekne listings</li>
            </ul>
            <Link className="lw-more" href="/business">What listing on Trekne includes<Icon name="arrow" /></Link>
          </div>

          <form className="lw-form" noValidate onSubmit={onSubmit} aria-describedby="lw-msg">
            <label className="lw-field"><span>Your name</span>
              <input className="lw-input" name="name" autoComplete="name" placeholder="e.g. Iba Lyngdoh" value={form.name} onChange={set("name")} disabled={done} required />
            </label>
            <label className="lw-field"><span>Business name</span>
              <input className="lw-input" name="business" autoComplete="organization" placeholder="e.g. Riverside Homestay" value={form.business} onChange={set("business")} disabled={done} required />
            </label>
            <div className="lw-field lw-wide"><span aria-hidden="true">What you’d list</span>
              <Dropdown id="lw-kind" className="dd-pill" label="What you’d list" value={kind} options={KINDS} onChange={setKind} />
            </div>
            <label className="lw-field"><span>Email</span>
              <input className="lw-input" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set("email")} disabled={done} />
            </label>
            <label className="lw-field"><span>Phone</span>
              <input className="lw-input" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} disabled={done} />
            </label>
            <p className="lw-hint lw-wide">Fill in at least one: email or phone.</p>
            <button className="btn btn-green lw-wide" type="submit" disabled={done}>
              {done ? <><Icon name="check" />On the list</> : "Join the business waitlist"}
            </button>
            <p id="lw-msg" className="lw-msg lw-wide" aria-live="polite" data-done={done || undefined}>{msg}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
