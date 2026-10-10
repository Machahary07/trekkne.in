"use client";

import { useEffect } from "react";

/**
 * Email links from the app land on the Site URL with tokens in the hash (#access_token…&type=signup).
 * The email is already confirmed by then, so send people to /welcome and drop the tokens from the URL.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    const h = window.location.hash;
    if (/[#&]type=(signup|magiclink|invite|recovery)/.test(h) || /[#&]error_code=/.test(h)) {
      window.location.replace(/error_code=/.test(h) ? "/login?error=link" : "/welcome");
    }
  }, []);
  return null;
}
