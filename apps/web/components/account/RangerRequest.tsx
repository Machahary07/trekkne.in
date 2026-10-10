"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";

/** Send or withdraw a Ranger request. Staff approve it in CRM → Users → Role requests. */
export function RangerRequest({ userId, pending }: { userId: string; pending: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function set(requested: "ranger" | null) {
    setBusy(true);
    setErr("");
    const { error } = await supabaseBrowser().from("profiles").update({ requested_role: requested }).eq("id", userId);
    setBusy(false);
    if (error) return setErr(error.message);
    router.refresh();
  }

  return (
    <>
      <button className={`btn ${pending ? "btn-ghost" : "btn-green"}`} type="button" disabled={busy} onClick={() => set(pending ? null : "ranger")}>
        {busy ? "Please wait…" : pending ? "Withdraw request" : <><Icon name="shield" />Request Ranger role</>}
      </button>
      {err && <p className="acct-err" role="status"><Icon name="alert" />{err}</p>}
    </>
  );
}
