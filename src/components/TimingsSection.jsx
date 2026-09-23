export default function TimingsSection({ branchConfig }) {
  const branchName =
    branchConfig?.gym?.branchName ||
    branchConfig?.name ||
    'Alpha Gym';

  const displayName =
    branchConfig?.gym?.displayName ||
    `Alpha Gym ${branchName}`;

  const morning =
    branchConfig?.timings?.morning ||
    branchConfig?.timings?.morningHours ||
    '6:00 AM – 12:00 PM';

  const evening =
    branchConfig?.timings?.evening ||
    branchConfig?.timings?.eveningHours ||
    '4:00 PM – 10:00 PM';

  return (
    <section
      id="timings"
      className="section timings-section"
      data-branch={branchConfig?.id || ''}
    >
      <div className="container">

        {/* SECTION HEADING */}
        <div className="section-heading timings-heading">
          <div className="section-tag">
            WHEN WE TRAIN
          </div>

          <h2>
            GYM
            <span> TIMINGS.</span>
          </h2>

          <p>
            Train at a time that works for you. Check the operating hours
            for {displayName}.
          </p>
        </div>

        {/* CURRENT BRANCH TIMING */}
        <div className="timings-grid">
          <article className="timing-card timing-orange">

            <div className="timing-top">
              <span className="timing-number">
                01
              </span>

              <span className="timing-status">
                OPEN HOURS
              </span>
            </div>

            <h3>
              {branchName.toUpperCase()}
            </h3>

            <div className="timing-divider" />

            <div className="timing-row">
              <span className="timing-label">
                MORNING
              </span>

              <strong>
                {morning}
              </strong>
            </div>

            <div className="timing-row">
              <span className="timing-label">
                EVENING
              </span>

              <strong>
                {evening}
              </strong>
            </div>

            <a
              href="#contact"
              className="timing-link"
            >
              GET DIRECTIONS / CONTACT <span>→</span>
            </a>

          </article>
        </div>

        {/* NOTE */}
        <div className="timings-note">
          <span>NOTE</span>

          <p>
            Timings may vary on holidays or special occasions.
            Please contact {displayName} for the latest schedule.
          </p>
        </div>

      </div>
    </section>
  );
}