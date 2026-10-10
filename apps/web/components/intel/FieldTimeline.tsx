"use client";

import { Icon } from "../Icon";
import { CATEGORY_ICON } from "./RouteMap";
import { REPORT_LABEL, type Report, type RouteNode } from "@/lib/destinations";

const UNCONFIRMED = new Set(["pending", "unverified"]);

/** Newest-first activity feed; expanding an item reveals attribution and evidence. */
export function FieldTimeline({
  reports,
  nodes,
  selectedId,
  onSelect,
}: {
  reports: Report[];
  nodes: RouteNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const sorted = [...reports].sort((a, b) => a.minutesAgo - b.minutesAgo);
  const place = (id?: string) => nodes.find((n) => n.id === id)?.label;

  return (
    <div className="tl">
      <div className="di-subhead">
        <span className="di-kicker"><Icon name="flag" />Field intelligence</span>
        <span className="mono">Newest first</span>
      </div>
      <ol className="tl-list">
        {sorted.map((r) => {
          const open = r.id === selectedId;
          const unconfirmed = UNCONFIRMED.has(r.status);
          return (
            <li key={r.id} className={`tl-item s-${r.status}`} data-open={open || undefined}>
              <span className="tl-node" aria-hidden="true"><Icon name={CATEGORY_ICON[r.category]} /></span>
              <div className="tl-body">
                <button
                  type="button"
                  className="tl-head"
                  aria-expanded={open}
                  aria-controls={`tl-${r.id}`}
                  onClick={() => onSelect(r.id)}
                >
                  <span className="tl-meta">
                    <span className={`st ${r.status}`}>{REPORT_LABEL[r.status]}</span>
                    <span className="mono">{r.when}</span>
                  </span>
                  <span className="tl-text">
                    {unconfirmed && <span className="sr-only">Unconfirmed: </span>}
                    {r.text}
                  </span>
                  <Icon name="chevron" className="ico tl-chev" />
                </button>
                <div id={`tl-${r.id}`} className="tl-more" hidden={!open}>
                  <dl>
                    <div><dt>Reported by</dt><dd>{r.reporter}</dd></div>
                    <div><dt>Verification</dt><dd>{r.verification}</dd></div>
                    {r.evidence && <div><dt>Evidence</dt><dd>{r.evidence}</dd></div>}
                    <div><dt>Location</dt><dd>{place(r.at) ?? "District-wide"}</dd></div>
                  </dl>
                  {unconfirmed && (
                    <p className="tl-warn"><Icon name="info" />Not confirmed yet. Shown for awareness, not as fact.</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
