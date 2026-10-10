import type { Metadata } from "next";
import { Planner } from "@/components/plan/Planner";
import { getCalendar, getNotices } from "@/lib/public-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Plan a trip",
  description: "Plan a Northeast India trip that checks every stop against carrying capacity, season, festivals, community closures and eco-risk.",
};

export default async function PlannerPage({ searchParams }: { searchParams: Promise<{ add?: string }> }) {
  const [{ add }, { events, places }, notices] = await Promise.all([searchParams, getCalendar(), getNotices()]);
  return (
    <section aria-labelledby="planner-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Trip planner</span>
          <h1 id="planner-h" style={{ fontSize: "clamp(42px, 6vw, 80px)", fontWeight: 800 }}>Plan it so the place is still there next year.</h1>
          <p>
            Pick your dates and add places to each day. Trekne checks every stop against carrying capacity, season, festivals and
            community closures, and suggests a quieter place when one is under pressure.
          </p>
        </div>
        <Planner
          places={places}
          events={events}
          notices={notices.map((n) => ({ destination_id: n.destination_id, kind: n.kind, title: n.title, starts_on: n.starts_on, ends_on: n.ends_on, community: n.community }))}
          initialAdd={add}
        />
      </div>
    </section>
  );
}
