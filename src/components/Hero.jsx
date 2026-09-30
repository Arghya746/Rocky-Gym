import athleteImage from '../assets/puja-offer.jpg.jpeg';

export default function Hero({ branchConfig }) {
  const branchName =
    branchConfig?.gym?.branchName ||
    branchConfig?.name ||
    'Alpha Gym';

  const displayName =
    branchConfig?.gym?.displayName ||
    `Alpha Gym ${branchName}`;

  const tagline =
    branchConfig?.gym?.tagline ||
    'TRAIN HARD • LIVE STRONG';

  const gymDescription =
    branchConfig?.gym?.description ||
    'Premium fitness training and gym facilities.';

  return (
    <section
      id="home"
      className="hero"
      data-branch={branchConfig?.id || ''}
    >
      <div className="hero-glow glow-one" />
      <div className="hero-glow glow-two" />

      <div className="container hero-grid">

        {/* =====================================================
            HERO CONTENT
            ===================================================== */}
        <div className="hero-content">

          {/* BRANCH TAG */}
          <div className="hero-tag">
            <span />
            {branchName.toUpperCase()} • ASANSOL
          </div>

          {/* MAIN HEADING */}
          <h1>
            TRAIN
            <span>HARD.</span>
            <br />
            LIVE
            <strong>STRONG.</strong>
          </h1>

          {/* DESCRIPTION */}
          <p className="hero-description">
            {gymDescription ||
              `Your body can do more than you think. Train smarter, track your progress and become the strongest version of yourself.`}
          </p>

          {/* BUTTONS */}
          <div className="hero-buttons">

            <a
              href="#plans"
              className="primary-btn"
            >
              START YOUR JOURNEY
              <span>→</span>
            </a>

            <a
              href="#portal"
              className="secondary-btn"
            >
              EXPLORE GYM SYSTEM
            </a>

          </div>

          {/* MINI STATS */}
          <div className="hero-mini-stats">

            <div>
              <strong>14+</strong>
              <span>YEARS EXPERIENCE</span>
            </div>

            <div>
              <strong>500+</strong>
              <span>MEMBERS TRAINED*</span>
            </div>

            <div>
              <strong>4.4★</strong>
              <span>LOCAL RATING*</span>
            </div>

          </div>

        </div>

        {/* =====================================================
            HERO IMAGE
            ===================================================== */}
        <div className="hero-visual">

          <div className="hero-circle" />

          <div className="energy energy-one" />
          <div className="energy energy-two" />

          <img
            src={athleteImage}
            alt={`${displayName} gym`}
            className="athlete"
          />

          {/* CALORIES CARD */}
          <div className="floating-card card-top">

            <span className="card-icon">
              🔥
            </span>

            <div>
              <small>
                CALORIES
              </small>

              <strong>
                742 kcal
              </strong>
            </div>

          </div>

          {/* LIVE TRAINING CARD */}
          <div className="floating-card card-bottom">

            <div className="pulse-dot" />

            <div>
              <small>
                LIVE TRAINING
              </small>

              <strong>
                SESSION ACTIVE
              </strong>
            </div>

          </div>

          {/* VERTICAL TEXT */}
          <div className="vertical-text">
            FITNESS • POWER • DISCIPLINE
          </div>

        </div>

      </div>
    </section>
  );
}