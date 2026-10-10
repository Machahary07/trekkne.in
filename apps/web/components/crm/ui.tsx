import { REPORT_LABEL, RISK_LABEL, type Level, type ReportStatus } from "@trekne/brand";

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="actions">{children}</div>}
    </header>
  );
}

export function LevelPill({ level, label }: { level: Level | null | undefined; label?: string }) {
  const l = level ?? "none";
  return <span className={`pill lvl-${l}`}><i />{label ?? RISK_LABEL[l]}</span>;
}

export function StatusPill({ status }: { status: ReportStatus | "published" }) {
  const label = status === "published" ? "Published" : REPORT_LABEL[status];
  return <span className={`pill st-${status}`}><i />{label}</span>;
}

export function RolePill({ name, color }: { name: string; color: string }) {
  return <span className="pill"><i style={{ background: color }} />{name}</span>;
}

const rtf = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });
export function ago(iso: string | null | undefined) {
  if (!iso) return "—";
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(s);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(s / 86400), "day");
  return fmtDate(iso);
}

export const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? iso + "T00:00:00" : iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const fmtNum = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-IN"));

/** Today's date in India, as YYYY-MM-DD (matches the database's planning day). */
export const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
