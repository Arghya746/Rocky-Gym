const plans = [
  {
    label: 'STARTER',
    title: 'MONTHLY',
    price: 1200,
    priceText: '₹1,200',
    perks: ['Gym Access', 'Basic Workout Guidance', 'Attendance Tracking', 'No Long Commitment'],
  },
  {
    label: 'POWER',
    title: '6 MONTHS',
    price: 950,
    priceText: '₹950',
    popular: true,
    perks: ['Full Gym Access', 'Workout Plan', 'Digital Member Profile', 'Progress Tracking'],
  },
  {
    label: 'TRANSFORMATION',
    title: 'ANNUAL',
    price: 800,
    priceText: '₹800',
    perks: ['Full Gym Access', 'Advanced Tracking', 'Digital Workout Plan', 'Best Value'],
  },
];

export default function PricingSection({ onSelectPlan }) {
  return (
    <section id="plans" className="section membership-section">
      <div className="container">
        <div className="section-heading centered">
          <div className="section-tag">MEMBERSHIP</div>

          <h2>
            CHOOSE YOUR
            <span>LEVEL.</span>
          </h2>

          <p>Flexible plans designed around your fitness goals.</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article key={plan.title} className={`price-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">MOST POPULAR</div>}

              <div className="price-label">{plan.label}</div>
              <h3>{plan.title}</h3>

              <div className="price">
                {plan.priceText}
                <small>/ month</small>
              </div>

              <ul>
                {plan.perks.map((perk) => (
                  <li key={perk}>✓ {perk}</li>
                ))}
              </ul>

              <button
                type="button"
                className="price-btn"
                onClick={() => onSelectPlan(plan.title, plan.price)}
              >
                SELECT PLAN
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
