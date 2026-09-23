const defaultTrainers = [
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

export default function TrainersSection({ branchConfig }) {
  const branchName =
    branchConfig?.gym?.branchName ||
    branchConfig?.name ||
    'Alpha Gym';

  const displayName =
    branchConfig?.gym?.displayName ||
    `Alpha Gym ${branchName}`;

  /*
   * Branch-specific trainers should come from:
   *
   * branchConfig.trainers
   *
   * Example:
   * trainers: [
   *   {
   *     name: 'Akram',
   *     role: 'STRENGTH & FITNESS COACH',
   *     experience: 'EXPERIENCED TRAINER',
   *     image: akramTrainerImage,
   *     className: 'trainer-orange',
   *   }
   * ]
   *
   * If trainer data has not been added yet,
   * the existing placeholder cards are shown.
   */
  const trainers =
    Array.isArray(branchConfig?.trainers) &&
    branchConfig.trainers.length > 0
      ? branchConfig.trainers
      : defaultTrainers;

  return (
    <section
      id="trainers"
      className="section trainers-section"
      data-branch={branchConfig?.id || ''}
    >
      <div className="container">

        {/* SECTION HEADING */}
        <div className="section-heading trainers-heading">
          <div className="section-tag">
            MEET THE {branchName.toUpperCase()} TEAM
          </div>

          <h2>
            TRAIN WITH
            <span> PURPOSE.</span>
          </h2>

          <p>
            Our trainers are here to guide you through proper techniques,
            structured workouts and consistent progress at {displayName}.
          </p>
        </div>

        {/* TRAINER CARDS */}
        <div className="trainers-grid">
          {trainers.map((trainer, index) => (
            <article
              key={trainer.id || `${trainer.name}-${index}`}
              className={`trainer-card ${
                trainer.className ||
                `trainer-${['orange', 'purple', 'cyan'][index % 3]}`
              }`}
            >
              {/* TRAINER PHOTO */}
              <div className="trainer-photo">
                {trainer.image ? (
                  <img
                    src={trainer.image}
                    alt={`${trainer.name} - ${trainer.role}`}
                    className="trainer-image"
                  />
                ) : (
                  <>
                    <span className="trainer-photo-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="trainer-photo-text">
                      TRAINER PHOTO
                    </span>
                  </>
                )}
              </div>

              {/* DETAILS */}
              <div className="trainer-info">
                <span className="trainer-experience">
                  {trainer.experience || 'EXPERIENCED TRAINER'}
                </span>

                <h3>
                  {trainer.name || 'TRAINER PROFILE'}
                </h3>

                <p>
                  {trainer.role || 'FITNESS & PERSONAL TRAINING COACH'}
                </p>

                <a
                  href="#contact"
                  className="trainer-link"
                >
                  TRAIN WITH US <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="trainers-cta">
          <div>
            <span>
              NEED PERSONAL GUIDANCE?
            </span>

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