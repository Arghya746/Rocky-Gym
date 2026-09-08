const services = [
  {
    number: '01',
    title: 'STRENGTH TRAINING',
    subtitle: 'BUILD YOUR POWER',
    description:
      'Build strength, muscle and confidence with structured resistance training designed for beginners as well as experienced members.',
    points: [
      'Free weights & machines',
      'Strength & muscle building',
      'Proper exercise techniques',
      'Progressive training',
    ],
    className: 'service-orange',
  },
  {
    number: '02',
    title: 'CARDIO TRAINING',
    subtitle: 'MOVE. SWEAT. IMPROVE.',
    description:
      'Improve stamina, endurance and overall fitness with effective cardio sessions that keep your body active and your energy high.',
    points: [
      'Cardio equipment',
      'Endurance training',
      'Fat-loss focused workouts',
      'Fitness conditioning',
    ],
    className: 'service-purple',
  },
  {
    number: '03',
    title: 'PERSONAL TRAINING',
    subtitle: 'TRAIN WITH PURPOSE',
    description:
      'Get proper guidance from experienced trainers with workout plans and techniques designed around your individual fitness goals.',
    points: [
      'Personalized workout plans',
      'Trainer guidance',
      'Exercise form correction',
      'Goal-based training',
    ],
    className: 'service-cyan',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="section services-section">
      <div className="container">

        {/* SECTION HEADING */}
        <div className="section-heading services-heading">
          <div className="section-tag">WHAT WE OFFER</div>

          <h2>
            TRAIN
            <span> YOUR WAY.</span>
          </h2>

          <p>
            Whether your goal is to build strength, improve endurance or get
            expert guidance, Alpha Gym gives you the environment and support
            to keep progressing.
          </p>
        </div>

        {/* SERVICES */}
        <div className="services-grid">
          {services.map((service) => (
            <article
              key={service.number}
              className={`service-card ${service.className}`}
            >
              <div className="service-top">
                <span className="service-number">{service.number}</span>
                <span className="service-line" />
              </div>

              <div className="service-content">
                <div className="service-subtitle">
                  {service.subtitle}
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <ul className="service-points">
                  {service.points.map((point) => (
                    <li key={point}>
                      <span>✓</span>
                      {point}
                    </li>
                  ))}
                </ul>

                <a href="#contact" className="service-link">
                  GET STARTED <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="services-cta">
          <div>
            <span className="services-cta-label">READY TO START?</span>

            <h3>
              YOUR
              <span> JOURNEY</span>
              <br />
              STARTS HERE.
            </h3>
          </div>

          <a href="#contact" className="services-cta-button">
            CONTACT ALPHA GYM <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}