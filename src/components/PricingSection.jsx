const defaultPlans = [
  {
    id: 'monthly',
    label: 'STARTER',
    title: 'MONTHLY',
    durationMonths: 1,
    price: 1500,
    perks: [
      'Gym Access',
      'Basic Workout Guidance',
      'Attendance Tracking',
      'No Long Commitment',
    ],
  },
  {
    id: 'half-yearly',
    label: 'TRANSFORMATION',
    title: 'HALF-YEARLY',
    durationMonths: 6,
    price: 4500,
    popular: true,
    perks: [
      'Full Gym Access',
      'Advanced Workout Plan',
      'Digital Member Profile',
      'Progress Tracking',
    ],
  },
  {
    id: 'yearly',
    label: 'ULTIMATE',
    title: 'YEARLY',
    durationMonths: 12,
    price: 8000,
    perks: [
      'Full Gym Access',
      'Advanced Tracking',
      'Digital Workout Plan',
      'Best Value',
    ],
  },
];

const getPlanLabel = (durationMonths) => {
  switch (Number(durationMonths)) {
    case 1:
      return 'STARTER';

    case 6:
      return 'TRANSFORMATION';

    case 12:
      return 'ULTIMATE';

    default:
      return 'MEMBERSHIP';
  }
};

const getPlanTitle = (plan) => {
  if (plan?.title) {
    return plan.title;
  }

  if (plan?.name) {
    return String(plan.name).toUpperCase();
  }

  switch (Number(plan?.durationMonths)) {
    case 1:
      return 'MONTHLY';

    case 6:
      return 'HALF-YEARLY';

    case 12:
      return 'YEARLY';

    default:
      return `${plan?.durationMonths || ''} MONTHS`;
  }
};

const getPlanPerks = (plan) => {
  if (
    Array.isArray(plan?.perks) &&
    plan.perks.length > 0
  ) {
    return plan.perks;
  }

  if (
    Array.isArray(plan?.benefits) &&
    plan.benefits.length > 0
  ) {
    return plan.benefits;
  }

  return [
    'Gym Access',
    'Workout Guidance',
    'Attendance Tracking',
    'Progress Tracking',
  ];
};

export default function PricingSection({
  onSelectPlan,
  branchConfig,
}) {
  const branchName =
    branchConfig?.gym?.branchName ||
    branchConfig?.name ||
    'Alpha Gym';

  const displayName =
    branchConfig?.gym?.displayName ||
    `Alpha Gym ${branchName}`;

  /*
   * Only regular membership plans are displayed here.
   *
   * Quarterly ₹2,499 is intentionally NOT included because
   * it is being treated as an OFFER instead of a regular plan.
   */
  const sourcePlans =
    Array.isArray(branchConfig?.membershipPlans) &&
    branchConfig.membershipPlans.length > 0
      ? branchConfig.membershipPlans
      : defaultPlans;

  /*
   * Extra protection:
   *
   * Even if a Quarterly plan accidentally exists inside
   * branchConfig.membershipPlans, it will not be displayed
   * in the normal Membership section.
   */
  const plans = sourcePlans
    .filter((plan) => {
      const durationMonths =
        Number(plan?.durationMonths);

      const title =
        String(
          plan?.title ||
          plan?.name ||
          ''
        ).toLowerCase();

      const isQuarterly =
        durationMonths === 3 ||
        title.includes('quarterly');

      return !isQuarterly;
    })
    .map((plan, index) => {
      const durationMonths =
        Number(plan?.durationMonths) || 1;

      const price =
        Number(plan?.price) || 0;

      return {
        ...plan,

        id:
          plan._id ||
          plan.id ||
          `${plan.name || plan.title || 'plan'}-${index}`,

        label:
          plan.label ||
          getPlanLabel(durationMonths),

        title:
          getPlanTitle(plan),

        durationMonths,

        price,

        priceText:
          `₹${price.toLocaleString('en-IN')}`,

        perks:
          getPlanPerks(plan),

        popular:
          plan.popular === true ||
          durationMonths === 6,
      };
    });

  return (
    <section
      id="plans"
      className="section membership-section"
      data-branch={branchConfig?.id || ''}
    >
      <div className="container">

        {/* SECTION HEADING */}
        <div className="section-heading centered">
          <div className="section-tag">
            {branchName.toUpperCase()} MEMBERSHIP
          </div>

          <h2>
            CHOOSE YOUR
            <span> LEVEL.</span>
          </h2>

          <p>
            Flexible membership plans designed around
            your fitness goals at {displayName}.
          </p>
        </div>

        {/* PRICING GRID */}
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`price-card ${
                plan.popular ? 'popular' : ''
              }`}
            >
              {plan.popular && (
                <div className="popular-badge">
                  MOST POPULAR
                </div>
              )}

              <div className="price-label">
                {plan.label}
              </div>

              <h3>
                {plan.title}
              </h3>

              <div className="price">
                {plan.priceText}

                <small>
                  {plan.durationMonths === 1
                    ? '/ month'
                    : ` / ${plan.durationMonths} months`}
                </small>
              </div>

              <ul>
                {plan.perks.map((perk) => (
                  <li key={perk}>
                    ✓ {perk}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="price-btn"
                onClick={() =>
                  onSelectPlan?.(
                    plan.title,
                    plan.price,
                    plan
                  )
                }
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