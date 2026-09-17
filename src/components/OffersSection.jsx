import { useEffect, useState } from 'react';
import API_URL from '../config/api';

export default function OffersSection({ onClaimOffer }) {

  const [offers, setOffers] = useState([]);

  useEffect(() => {

    const fetchOffers = async () => {

      try {

        const response = await fetch(
          `${API_URL}/api/offers/public`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }

        const data = await response.json();

        // Remove duplicate offers
        const uniqueOffers = Array.from(
          new Map(
            (data.offers || []).map((offer) => [
              `${offer.name}-${offer.offerPrice}-${offer.plan?._id}`,
              offer,
            ])
          ).values()
        );

        setOffers(uniqueOffers);

      } catch (error) {

        console.error(
          'Failed to fetch offers:',
          error
        );

        setOffers([]);

      }

    };

    fetchOffers();

  }, []);


  const getOfferDetails = (offer) => {

    const name = offer.name.toLowerCase();

    if (name.includes('monsoon')) {

      return {
        season: '🌧 MONSOON',
        badge: 'LIMITED TIME',
        title: 'MONSOON\nMUSCLE',
        className: 'monsoon',
        icon: '🌧️',
      };

    }

    if (
      name.includes('puja') ||
      name.includes('transformation')
    ) {

      return {
        season: '🪔 DURGA PUJA',
        badge: 'FESTIVE SPECIAL',
        title: 'PUJA\nTRANSFORMATION',
        className: 'puja featured-offer',
        icon: '🪔',
      };

    }

    if (name.includes('summer')) {

      return {
        season: '☀ SUMMER',
        badge: 'SHRED SEASON',
        title: 'SUMMER\nSHRED',
        className: 'summer',
        icon: '☀️',
      };

    }

    if (name.includes('winter')) {

      return {
        season: '❄ WINTER',
        badge: 'BULK SEASON',
        title: 'WINTER\nPOWER',
        className: 'winter',
        icon: '❄️',
      };

    }

    return {
      season: '🔥 SPECIAL OFFER',
      badge: 'LIMITED TIME',
      title: offer.name,
      className: '',
      icon: '🔥',
    };

  };


  return (

    <section id="offers" className="offers-section">

      <div className="container">

        <div className="section-heading centered">

          <div className="section-tag">
            LIMITED TIME OFFERS
          </div>

          <h2>
            TRAIN MORE.
            <span>SAVE MORE.</span>
          </h2>

          <p>
            Special seasonal memberships designed to keep you training all year round.
          </p>

        </div>


        <div className="offers-grid">

          {offers.map((offer) => {

            const details =
              getOfferDetails(offer);

            return (

              <article
                key={offer._id}
                className={`offer-card ${details.className}`}
              >

                <div className="offer-top">

                  <span className="offer-season">
                    {details.season}
                  </span>

                  <span className="offer-badge">
                    {details.badge}
                  </span>

                </div>


                <div className="offer-icon">
                  {details.icon}
                </div>


                <h3>
                  {details.title
                    .split('\n')
                    .map((line, index) => (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    ))}
                </h3>


                <p>
                  {offer.description}
                </p>


                <div className="offer-price">

                  <small>
                    {details.className.includes('puja')
                      ? 'SPECIAL PRICE'
                      : 'STARTING FROM'}
                  </small>

                  <strong>
                    ₹
                    {Number(
                      offer.offerPrice
                    ).toLocaleString('en-IN')}
                  </strong>

                  <span>
                    {offer.plan?.durationMonths === 3
                      ? '/ 3 months'
                      : '/ month'}
                  </span>

                </div>


                <ul>

                  {(offer.benefits || []).map(
                    (benefit, index) => (

                      <li key={index}>
                        ✓ {benefit}
                      </li>

                    )
                  )}

                </ul>


                <button
                  type="button"
                  className="offer-btn"
                  onClick={() =>
                    onClaimOffer(offer.name)
                  }
                >
                  CLAIM OFFER →
                </button>

              </article>

            );

          })}

        </div>


        <div className="offers-whatsapp">

          <div>

            <span>
              📲 SPECIAL OFFER ENQUIRY
            </span>

            <h3>
              Want today's best deal?
            </h3>

            <p>
              Talk to Alpha Gym directly on WhatsApp.
            </p>

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