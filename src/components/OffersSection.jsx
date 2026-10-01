import pujaOfferImage from '../assets/PUJA OFFERS.jpg';

export default function OffersSection({
  onClaimOffer,
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
   * Branch-specific WhatsApp number can be supplied
   * through branchConfig later.
   *
   * Kalyanpur currently uses the existing number.
   * Gopalpur can be updated when its number is confirmed.
   */
  const whatsappNumber =
    branchConfig?.gym?.whatsapp ||
    branchConfig?.gym?.phone ||
    '918927100145';

  const whatsappMessage = encodeURIComponent(
    `Hi Alpha Gym, I want to know about the Puja Offer at ${branchName}.`
  );

  return (
    <section
      id="offers"
      className="offers-section"
      data-branch={branchConfig?.id || ''}
    >
      <div className="container">

        {/* =====================================================
            SECTION HEADING
            ===================================================== */}
        <div className="section-heading centered">

          <div className="section-tag">
            {branchName.toUpperCase()} • PUJA SPECIAL
          </div>

          <h2>
            PUJA
            <span>OFFER</span>
          </h2>

          <p>
            Celebrate Puja with a special membership offer at{' '}
            {displayName}.
          </p>

        </div>

        {/* =====================================================
            PUJA OFFER POSTER
            ===================================================== */}
        <div className="puja-offer-wrapper">

          <div className="puja-offer-card">

            <div className="puja-offer-image-wrapper">

              <img
                src={pujaOfferImage}
                alt={`${displayName} Puja Offers`}
                className="puja-offer-image"
              />

            </div>

            {/* =================================================
                OFFER ACTION
                ================================================= */}
            <div className="puja-offer-actions">

              <button
                type="button"
                className="offer-btn"
                onClick={() =>
                  onClaimOffer?.(
                    `Puja Offer - ${branchName}`
                  )
                }
              >
                CLAIM PUJA OFFER →
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            WHATSAPP CTA
            ===================================================== */}
        <div className="offers-whatsapp">

          <div>

            <span>
              📲 PUJA OFFER ENQUIRY
            </span>

            <h3>
              Interested in the Puja Offer?
            </h3>

            <p>
              Talk to {displayName} directly on WhatsApp.
            </p>

          </div>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
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