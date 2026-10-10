"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon } from "../Icon";

export function SignOutButton({ className = "btn btn-ghost btn-sm", to = "/super" }: { className?: string; to?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        router.replace(to);
        router.refresh();
      }}
    >
      <Icon name="logout" />Sign out
    </button>
  );
}
