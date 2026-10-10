"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";

/**
 * Actions on a saved trip. "Confirm" sets status `planned`, which is what adds the group to each stop's expected
 * visitors (and the authorities' crowding forecast); a draft doesn't count yet.
 */
export function TripActions({ id, confirmed, past }: { id: string; confirmed: boolean; past: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [err, setErr] = useState("");

  async function run(op: () => PromiseLike<{ error: { message: string } | null }>) {
    setBusy(true);
    setErr("");
    const { error } = await op();
    setBusy(false);
    if (error) return setErr(error.message);
    router.refresh();
  }
  const supabase = supabaseBrowser();

  return (
    <div className="trip-actions">
      {!past && (
        <button
          type="button"
          className={`btn btn-sm ${confirmed ? "btn-ghost" : "btn-green"}`}
          disabled={busy}
          onClick={() => run(() => supabase.from("trips").update({ status: confirmed ? "draft" : "planned" }).eq("id", id))}
        >
          <Icon name={confirmed ? "close" : "check"} />{confirmed ? "Unconfirm" : "Confirm trip"}
        </button>
      )}
      <Link className="btn btn-ghost btn-sm" href={`/planner?trip=${id}`}><Icon name="route" />Open in planner</Link>
      {asking ? (
        <span className="trip-ask">
          Delete this trip?
          <button type="button" className="btn btn-sm trip-del" disabled={busy} onClick={() => run(() => supabase.from("trips").delete().eq("id", id))}>Delete</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAsking(false)}>Keep</button>
        </span>
      ) : (
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Delete trip" onClick={() => setAsking(true)}><Icon name="trash" /></button>
      )}
      {err && <span className="trip-err" role="status"><Icon name="alert" />{err}</span>}
    </div>
  );
}
