import { useEffect, useState } from 'react';
import API_URL from '../config/api';

export default function OffersSection({
  onClaimOffer,
  branchConfig,
}) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const branchName =
    branchConfig?.gym?.branchName ||
    branchConfig?.name ||
    '';

  const displayName =
    branchConfig?.gym?.displayName ||
    `Alpha Gym ${branchName}`;

  useEffect(() => {
    let isMounted = true;

    const fetchOffers = async () => {
      try {
        setLoading(true);

        if (!branchName) {
          console.warn(
            'OffersSection: No gym branch was provided.'
          );

          if (isMounted) {
            setOffers([]);
          }

          return;
        }

        const response = await fetch(
          `${API_URL}/api/offers/public?gymBranch=${encodeURIComponent(
            branchName
          )}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }

        const data = await response.json();

        /*
         * Remove duplicate offers.
         */
        const uniqueOffers = Array.from(
          new Map(
            (data.offers || []).map((offer) => [
              `${offer.name}-${offer.offerPrice}-${offer.plan?._id}`,
              offer,
            ])
          ).values()
        );

        /*
         * Extra frontend branch protection.
         *
         * Even if the backend accidentally returns another branch,
         * don't display it on this branch's public page.
         */
        const branchOffers = uniqueOffers.filter((offer) => {
          if (!offer?.gymBranch) {
            return true;
          }

          return (
            String(offer.gymBranch).trim().toLowerCase() ===
            String(branchName).trim().toLowerCase()
          );
        });

        if (isMounted) {
          setOffers(branchOffers);
        }
      } catch (error) {
        console.error(
          'Failed to fetch offers:',
          error
        );

        if (isMounted) {
          setOffers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOffers();

    return () => {
      isMounted = false;
    };
  }, [branchName]);

  const getOfferDetails = (offer) => {
    const name = String(
      offer?.name || ''
    ).toLowerCase();

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
      title: offer?.name || 'SPECIAL OFFER',
      className: '',
      icon: '🔥',
    };
  };

  return (
    <section
      id="offers"
      className="offers-section"
      data-branch={branchConfig?.id || ''}
    >
      <div className="container">

        {/* SECTION HEADING */}
        <div className="section-heading centered">
          <div className="section-tag">
            {branchName
              ? `${branchName.toUpperCase()} • LIMITED TIME OFFERS`
              : 'LIMITED TIME OFFERS'}
          </div>

          <h2>
            TRAIN MORE.
            <span>SAVE MORE.</span>
          </h2>

          <p>
            Special seasonal memberships designed to keep you
            training all year round at {displayName}.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="offers-empty">
            <p>Loading current offers...</p>
          </div>
        )}

        {/* NO OFFERS */}
        {!loading && offers.length === 0 && (
          <div className="offers-empty">
            <p>
              No special offers are currently available at{' '}
              {displayName}.
            </p>
          </div>
        )}

        {/* OFFERS */}
        {!loading && offers.length > 0 && (
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
                    {offer.description ||
                      'Special membership offer available for a limited time.'}
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
                        offer.offerPrice || 0
                      ).toLocaleString('en-IN')}
                    </strong>

                    <span>
                      {offer.plan?.durationMonths === 3
                        ? '/ 3 months'
                        : offer.plan?.durationMonths
                          ? `/ ${offer.plan.durationMonths} months`
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
                      onClaimOffer?.(offer.name)
                    }
                  >
                    CLAIM OFFER →
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {/* WHATSAPP CTA */}
        <div className="offers-whatsapp">
          <div>
            <span>
              📲 SPECIAL OFFER ENQUIRY
            </span>

            <h3>
              Want today's best deal?
            </h3>

            <p>
              Talk to {displayName} directly on WhatsApp.
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