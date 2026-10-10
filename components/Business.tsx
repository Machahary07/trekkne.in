import { Icon } from "./Icon";

export function Business() {
  return (
    <section id="business" aria-labelledby="biz-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">For guides, homestays &amp; operators</span>
          <h2 id="biz-h">Grow with the places you call home.</h2>
        </div>
        <div className="biz">
          <article>
            <span className="ic" style={{ background: "var(--orange)" }}><Icon name="backpack" /></span>
            <h3>Guide bookings</h3>
            <p>Travellers find and book approved local guides with clear prices and verified profiles.</p>
            <div className="example"><b>₹2,000 booking</b>Proposed 10% platform commission (₹200), with final rates set together with participating guides.</div>
          </article>
          <article>
            <span className="ic" style={{ background: "var(--yellow)" }}><Icon name="store" /></span>
            <h3>Verified listings</h3>
            <p>Homestays, hotels, agencies and activity operators get a trusted profile on trekne.in.</p>
            <ul>
              <li><Icon name="check" />Verified business badge</li>
              <li><Icon name="check" />Booking &amp; availability tools</li>
              <li><Icon name="check" />Clearly labelled promotion</li>
            </ul>
          </article>
          <article>
            <span className="ic" style={{ background: "var(--blue)" }}><Icon name="chart" /></span>
            <h3>Destination dashboards</h3>
            <p>Aggregated insights for operators and destination managers on access, environment and seasonality.</p>
            <ul>
              <li><Icon name="check" />Visitor trends where records exist</li>
              <li><Icon name="check" />Recurring access &amp; waste issues</li>
              <li><Icon name="check" />Planning-ready summaries</li>
            </ul>
          </article>
        </div>
        <p className="note-line"><Icon name="shield" />Paid promotion never changes a safety warning. Essential advisories stay free for every traveller.</p>
      </div>
    </section>
  );
}
