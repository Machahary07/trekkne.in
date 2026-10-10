"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** Runs a Supabase mutation, shows a toast, refreshes server data. */
export function useAction() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const run = useCallback(
    async (fn: () => PromiseLike<{ error: { message: string } | null }>, ok: string) => {
      setBusy(true);
      const { error } = await fn();
      setBusy(false);
      setToast(error ? error.message : ok);
      if (!error) router.refresh();
      return !error;
    },
    [router],
  );

  return { run, busy, toast, setToast };
}

export function Toast({ text }: { text: string | null }) {
  return text ? <div className="toast" role="status">{text}</div> : null;
}
