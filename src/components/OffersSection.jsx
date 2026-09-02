const offers = [
  {
    season: '🌧 MONSOON',
    badge: 'LIMITED TIME',
    title: 'MONSOON\nMUSCLE',
    description: "Don't let the rain stop your progress. Join Alpha Gym and stay consistent this season.",
    priceLabel: 'STARTING FROM',
    price: '₹999',
    suffix: '/ month',
    perks: ['Full Gym Access', 'Workout Guidance', 'Digital Attendance'],
    className: 'monsoon',
    buttonLabel: 'CLAIM OFFER →',
    offerName: 'Monsoon Muscle Offer',
  },
  {
    season: '🪔 DURGA PUJA',
    badge: 'FESTIVE SPECIAL',
    title: 'PUJA\nTRANSFORMATION',
    description: 'Get festival ready with a dedicated transformation program at Alpha Gym.',
    priceLabel: 'SPECIAL PRICE',
    price: '₹2,499',
    suffix: '/ 3 months',
    perks: ['3 Month Gym Access', 'Personalized Workout Plan', 'Progress Tracking'],
    className: 'puja featured-offer',
    buttonLabel: 'CLAIM OFFER →',
    offerName: 'Durga Puja Transformation Offer',
  },
  {
    season: '☀ SUMMER',
    badge: 'SHRED SEASON',
    title: 'SUMMER\nSHRED',
    description: 'Build confidence, burn fat and get ready for your strongest summer.',
    priceLabel: 'STARTING FROM',
    price: '₹899',
    suffix: '/ month',
    perks: ['Cardio + Strength Training', 'Fat Loss Guidance', 'Progress Tracking'],
    className: 'summer',
    buttonLabel: 'CLAIM OFFER →',
    offerName: 'Summer Shred Offer',
  },
  {
    season: '❄ WINTER',
    badge: 'BULK SEASON',
    title: 'WINTER\nPOWER',
    description: 'Use the winter season to build strength, muscle and serious discipline.',
    priceLabel: 'STARTING FROM',
    price: '₹1,099',
    suffix: '/ month',
    perks: ['Strength Training', 'Muscle Building Plan', 'Trainer Guidance'],
    className: 'winter',
    buttonLabel: 'CLAIM OFFER →',
    offerName: 'Winter Power Offer',
  },
];

export default function OffersSection({ onClaimOffer }) {
  return (
    <section id="offers" className="offers-section">
      <div className="container">
        <div className="section-heading centered">
          <div className="section-tag">LIMITED TIME OFFERS</div>

          <h2>
            TRAIN MORE.
            <span>SAVE MORE.</span>
          </h2>

          <p>Special seasonal memberships designed to keep you training all year round.</p>
        </div>

        <div className="offers-grid">
          {offers.map((offer) => (
            <article key={offer.offerName} className={`offer-card ${offer.className}`}>
              <div className="offer-top">
                <span className="offer-season">{offer.season}</span>
                <span className="offer-badge">{offer.badge}</span>
              </div>

              <div className="offer-icon">
                {offer.className.includes('monsoon') ? '🌧️' : offer.className.includes('puja') ? '🪔' : offer.className.includes('summer') ? '☀️' : '❄️'}
              </div>

              <h3>{offer.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h3>

              <p>{offer.description}</p>

              <div className="offer-price">
                <small>{offer.priceLabel}</small>
                <strong>{offer.price}</strong>
                <span>{offer.suffix}</span>
              </div>

              <ul>
                {offer.perks.map((perk) => (
                  <li key={perk}>✓ {perk}</li>
                ))}
              </ul>

              <button type="button" className="offer-btn" onClick={() => onClaimOffer(offer.offerName)}>
                {offer.buttonLabel}
              </button>
            </article>
          ))}
        </div>

        <div className="offers-whatsapp">
          <div>
            <span>📲 SPECIAL OFFER ENQUIRY</span>
            <h3>Want today's best deal?</h3>
            <p>Talk to Alpha Gym directly on WhatsApp.</p>
          </div>

          <a
            href="https://wa.me/918927100145?text=Hi%20Alpha%20Gym%2C%20I%20want%20to%20know%20about%20your%20current%20offers."
            target="_blank"
            rel="noreferrer"
            className="whatsapp-btn"
          >
            💬 CHAT ON WHATSAPP
          </a>
        </div>
      </div>
    </section>
  );
}
