import athleteImage from '../assets/alpha-gym-unisex.jpg';

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-glow glow-one" />
      <div className="hero-glow glow-two" />

      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-tag">
            <span /> KALYANPUR • GOPALPUR | ASANSOL
          </div>

          <h1>
            TRAIN
            <span>HARD.</span>
            <br />
            LIVE
            <strong>STRONG.</strong>
          </h1>

          <p className="hero-description">
            Your body can do more than you think. Train smarter, track your progress and become
            the strongest version of yourself.
          </p>

          <div className="hero-buttons">
            <a href="#plans" className="primary-btn">
              START YOUR JOURNEY
              <span>→</span>
            </a>

            <a href="#portal" className="secondary-btn">
              EXPLORE GYM SYSTEM
            </a>
          </div>

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

        <div className="hero-visual">
          <div className="hero-circle" />
          <div className="energy energy-one" />
          <div className="energy energy-two" />

          <img src={athleteImage} alt="Alpha Gym Unisex Gym" className="athlete" />

          <div className="floating-card card-top">
            <span className="card-icon">🔥</span>
            <div>
              <small>CALORIES</small>
              <strong>742 kcal</strong>
            </div>
          </div>

          <div className="floating-card card-bottom">
            <div className="pulse-dot" />
            <div>
              <small>LIVE TRAINING</small>
              <strong>SESSION ACTIVE</strong>
            </div>
          </div>

          <div className="vertical-text">FITNESS • POWER • DISCIPLINE</div>
        </div>
      </div>
    </section>
  );
}
