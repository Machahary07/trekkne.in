"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "../Icon";

/* The same three sample conditions the hero chips show. */
const ALERTS: Array<{ icon: IconName; color: string; day: string; text: string }> = [
  { icon: "rain", color: "var(--yellow)", day: "Day 1", text: "Afternoon rain at Nongriat" },
  { icon: "alert", color: "var(--orange)", day: "Day 2", text: "Road slip near Sohra, verified" },
  { icon: "sun", color: "var(--green)", day: "Day 3", text: "Dry all weekend at Dawki" },
];

/** App icon with an unread badge. Tap it and a trip alert drops in like a push notification; the badge counts down. */
export function TripAlerts() {
  const [read, setRead] = useState(0);
  const [shown, setShown] = useState<number | null>(null);
  const [taps, setTaps] = useState(0);

  // Notifications tuck away on their own after a few seconds.
  useEffect(() => {
    if (shown === null) return;
    const id = setTimeout(() => setShown(null), 3200);
    return () => clearTimeout(id);
  }, [shown, taps]);

  // Each tap opens the next unread alert; once all are read, the next tap starts over.
  const tap = () => {
    const i = read >= ALERTS.length ? 0 : read;
    setShown(i);
    setRead(i + 1);
    setTaps((t) => t + 1);
  };
  const unread = ALERTS.length - read;
  const a = shown === null ? null : ALERTS[shown];

  return (
    <>
      {a && (
        <div key={taps} className="push" role="status">
          <span className="dot" style={{ background: a.color }}><Icon name={a.icon} /></span>
          <span><small>Trekne · {a.day}</small>{a.text}</span>
        </div>
      )}
      <button type="button" className="appicon" onClick={tap} data-quiet={unread === 0 || undefined}
        aria-label={unread ? `Trip alerts, ${unread} unread. Tap to open the next one` : "Trip alerts, all read. Tap to replay"}>
        <Icon name="calendar" />
        {unread > 0 && <b key={unread}>{unread}</b>}
      </button>
    </>
  );
}
