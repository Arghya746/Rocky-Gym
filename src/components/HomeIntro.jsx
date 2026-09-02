const features = [
  {
    number: '01',
    icon: '🏋️',
    title: 'REAL TRAINING',
    description: 'Serious equipment, dedicated training zones and a focused environment.',
    link: '#contact',
    linkText: 'Explore →',
    className: 'feature-orange',
  },
  {
    number: '02',
    icon: '⚡',
    title: 'SMART TRACKING',
    description: 'Monitor attendance, membership, workouts and payments digitally.',
    link: '#portal',
    linkText: 'View System →',
    className: 'feature-purple',
  },
  {
    number: '03',
    icon: '🥇',
    title: 'RESULT FOCUSED',
    description: 'Structured routines and progress tracking designed to keep members consistent.',
    link: '#plans',
    linkText: 'See Plans →',
    className: 'feature-cyan',
  },
];

export default function HomeIntro() {
  return (
    <section id="features" className="section">
      <div className="container">
        <div className="section-heading">
          <div className="section-tag">WHY ALPHA GYM</div>

          <h2>
            MORE THAN
            <span>A GYM.</span>
          </h2>

          <p>
            Everything you need to transform your body, improve your performance and stay
            consistent.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.number} className={`feature-card ${feature.className}`}>
              <div className="feature-number">{feature.number}</div>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <a href={feature.link}>{feature.linkText}</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
