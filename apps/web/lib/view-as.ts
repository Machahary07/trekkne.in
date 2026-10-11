/**
 * "Preview as role": a super admin can see the site and CRM with a lower role's permissions.
 * The cookie only narrows what the app shows; the database still runs as the real user (RLS),
 * and the server ignores it for anyone who isn't a super admin.
 * Value: `<role key>|<role name>` (the name is only for the client-side bar).
 */
export const VIEW_AS_COOKIE = "trekne-view-as";

export function parseViewAs(value: string | undefined | null): { key: string; name: string } | null {
  if (!value) return null;
  const [key, ...name] = decodeURIComponent(value).split("|");
  return key ? { key, name: name.join("|") || key } : null;
}
