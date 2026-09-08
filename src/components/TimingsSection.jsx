const timings = [
  {
    number: '01',
    location: 'KALYANPUR',
    morning: '6:00 AM – 12:00 PM',
    evening: '4:00 PM – 10:00 PM',
    className: 'timing-orange',
  },
  {
    number: '02',
    location: 'GOPALPUR',
    morning: '6:00 AM – 11:00 AM',
    evening: '4:00 PM – 10:00 PM',
    className: 'timing-purple',
  },
];

export default function TimingsSection() {
  return (
    <section id="timings" className="section timings-section">
      <div className="container">
        <div className="section-heading timings-heading">
          <div className="section-tag">WHEN WE TRAIN</div>

          <h2>
            GYM<span> TIMINGS.</span>
          </h2>

          <p>
            Train at a time that works for you. Check the operating hours
            for your preferred Alpha Gym location.
          </p>
        </div>

        <div className="timings-grid">
          {timings.map((timing) => (
            <article
              key={timing.number}
              className={`timing-card ${timing.className}`}
            >
              <div className="timing-top">
                <span className="timing-number">{timing.number}</span>

                <span className="timing-status">
                  OPEN HOURS
                </span>
              </div>

              <h3>{timing.location}</h3>

              <div className="timing-divider" />

              <div className="timing-row">
                <span className="timing-label">MORNING</span>
                <strong>{timing.morning}</strong>
              </div>

              <div className="timing-row">
                <span className="timing-label">EVENING</span>
                <strong>{timing.evening}</strong>
              </div>

              <a href="#contact" className="timing-link">
                GET DIRECTIONS / CONTACT <span>→</span>
              </a>
            </article>
          ))}
        </div>

        <div className="timings-note">
          <span>NOTE</span>

          <p>
            Timings may vary on holidays or special occasions.
            Please contact Alpha Gym for the latest schedule.
          </p>
        </div>
      </div>
    </section>
  );
}