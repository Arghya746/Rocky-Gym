const trainers = [
  {
    number: '01',
    name: 'TRAINER PROFILE',
    role: 'STRENGTH & FITNESS COACH',
    experience: 'EXPERIENCED TRAINER',
    className: 'trainer-orange',
  },
  {
    number: '02',
    name: 'TRAINER PROFILE',
    role: 'FITNESS & CARDIO COACH',
    experience: 'EXPERIENCED TRAINER',
    className: 'trainer-purple',
  },
  {
    number: '03',
    name: 'TRAINER PROFILE',
    role: 'PERSONAL TRAINING COACH',
    experience: 'EXPERIENCED TRAINER',
    className: 'trainer-cyan',
  },
];

export default function TrainersSection() {
  return (
    <section id="trainers" className="section trainers-section">
      <div className="container">

        {/* SECTION HEADING */}
        <div className="section-heading trainers-heading">
          <div className="section-tag">MEET THE TEAM</div>

          <h2>
            TRAIN WITH
            <span> PURPOSE.</span>
          </h2>

          <p>
            Our trainers are here to guide you through proper techniques,
            structured workouts and consistent progress.
          </p>
        </div>

        {/* TRAINER CARDS */}
        <div className="trainers-grid">
          {trainers.map((trainer) => (
            <article
              key={trainer.number}
              className={`trainer-card ${trainer.className}`}
            >
              {/* PHOTO PLACEHOLDER */}
              <div className="trainer-photo">
                <span className="trainer-photo-number">
                  {trainer.number}
                </span>

                <span className="trainer-photo-text">
                  TRAINER PHOTO
                </span>
              </div>

              {/* DETAILS */}
              <div className="trainer-info">
                <span className="trainer-experience">
                  {trainer.experience}
                </span>

                <h3>{trainer.name}</h3>

                <p>{trainer.role}</p>

                <a href="#contact" className="trainer-link">
                  TRAIN WITH US <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="trainers-cta">
          <div>
            <span>NEED PERSONAL GUIDANCE?</span>

            <h3>
              FIND THE RIGHT
              <strong> TRAINING.</strong>
            </h3>
          </div>

          <a href="#contact">
            CONTACT US <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}