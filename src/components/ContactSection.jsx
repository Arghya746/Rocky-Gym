import { useState } from 'react';
import API_URL from '../config/api';

export default function ContactSection({ branchConfig }) {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    goal: 'Muscle Building',
    message: '',
  });

  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =========================================================
     BRANCH
     ========================================================= */

  const gymBranch =
    branchConfig?.name === 'Gopalpur'
      ? 'Gopalpur'
      : branchConfig?.name === 'Kalyanpur'
        ? 'Kalyanpur'
        : '';

  const isGopalpur = gymBranch === 'Gopalpur';

  /* =========================================================
     BRANCH LOCATION DATA
     ========================================================= */

  const locationData = isGopalpur
    ? {
        branchName: 'GOPALPUR',
        locationLabel: 'GOPALPUR',
        address: (
          <>
            Premises No. 596/N, Rozi Niwas, 2nd Floor,
            <br />
            Above Wine Shop, Opposite Pizza Express,
            <br />
            P.R. Mukherjee, Mother Teresa Road,
            <br />
            Chelidanga, Asansol, West Bengal 713304
          </>
        ),
        shortAddress: (
          <>
            Premises No. 596/N, Rozi Niwas, 2nd Floor,
            <br />
            Chelidanga, Asansol - 713304
          </>
        ),
        mapTitle: 'Alpha Gym Gopalpur Chelidanga Asansol',
        mapUrl:
          'https://www.google.com/maps?q=Alpha%20Gym%20Chelidanga%20Asansol&output=embed',
      }
    : {
        branchName: 'KALYANPUR',
        locationLabel: 'KALYANPUR',
        address: (
          <>
            1st Floor, Anudeep Apartment, Plot 43,
            <br />
            Near Kalyanpur Adi Durgapuja Pandal,
            <br />
            Kalyanpur Housing, Kanyapur,
            <br />
            Asansol, West Bengal 713305
          </>
        ),
        shortAddress: (
          <>
            1st Floor, Anudeep Apartment, Plot 43,
            <br />
            Kalyanpur Housing, Asansol - 713305
          </>
        ),
        mapTitle: 'Alpha Gym Kalyanpur Asansol',
        mapUrl:
          'https://www.google.com/maps?q=Alpha%20Gym%20Kalyanpur%20Asansol&output=embed',
      };

  /* =========================================================
     FORM CHANGE
     ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear previous message when user starts editing again
    if (formMessage) {
      setFormMessage('');
    }
  };

  /* =========================================================
     FORM SUBMIT
     ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const {
      name,
      phone,
      goal,
      message,
    } = formState;

    /* -------------------------------------------------------
       NAME + PHONE VALIDATION
    ------------------------------------------------------- */

    if (!name.trim() || !phone.trim()) {
      setFormMessage(
        'Please enter your name and phone number.'
      );
      return;
    }

    /* -------------------------------------------------------
       PHONE VALIDATION
    ------------------------------------------------------- */

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setFormMessage(
        'Please enter a valid 10-digit phone number.'
      );
      return;
    }

    /* -------------------------------------------------------
       BRANCH VALIDATION
    ------------------------------------------------------- */

    if (
      gymBranch !== 'Kalyanpur' &&
      gymBranch !== 'Gopalpur'
    ) {
      console.error(
        'Contact form branch is missing or invalid:',
        {
          branchConfig,
          gymBranch,
        }
      );

      setFormMessage(
        'Unable to identify the gym branch. Please refresh the page and try again.'
      );

      return;
    }

    /* -------------------------------------------------------
       GOAL VALIDATION
    ------------------------------------------------------- */

    const allowedGoals = [
      'Muscle Building',
      'Fat Loss',
      'Strength',
      'General Fitness',
    ];

    if (!allowedGoals.includes(goal)) {
      setFormMessage(
        'Please select a valid fitness goal.'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      setFormMessage(
        'Submitting your enquiry...'
      );

      /* -----------------------------------------------------
         CONTACT API
      ----------------------------------------------------- */

      const response = await fetch(
        `${API_URL}/api/contacts`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            gymBranch: gymBranch,
            name: name.trim(),
            phone: phone.trim(),
            goal: goal,
            message: message.trim(),
          }),
        }
      );

      /* -----------------------------------------------------
         READ RESPONSE SAFELY
      ----------------------------------------------------- */

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      /* -----------------------------------------------------
         API ERROR
      ----------------------------------------------------- */

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to submit your enquiry. Server returned ${response.status}.`
        );
      }

      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      setFormMessage(
        `Thanks ${name.trim()}! Your ${goal.toLowerCase()} enquiry for ${gymBranch} has been submitted successfully.`
      );

      /* -----------------------------------------------------
         RESET FORM
      ----------------------------------------------------- */

      setFormState({
        name: '',
        phone: '',
        goal: 'Muscle Building',
        message: '',
      });

    } catch (error) {
      console.error(
        'Contact form error:',
        error
      );

      setFormMessage(
        error.message ||
          'Unable to submit your enquiry. Please try again.'
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="section contact-section"
    >

      {/* =====================================================
          CONTACT INFORMATION + FORM
      ===================================================== */}

      <div className="container contact-grid">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="contact-left">

          <div className="section-tag">
            START TODAY
          </div>

          <h2>
            READY TO
            <span>TRAIN?</span>
          </h2>

          <p>
            Book a free trial session and experience
            the Alpha Gym environment.
          </p>

          <div className="contact-info">

            {/* =============================================
                CURRENT BRANCH LOCATION
            ============================================= */}

            <div className="contact-info-item">

              <span>📍</span>

              <div>

                <small>
                  LOCATION — {locationData.locationLabel}
                </small>

                <strong>
                  {locationData.address}
                </strong>

              </div>

            </div>


    <div className="contact-info-item">

  <span>🕐</span>

  <div>

    <small>
      {gymBranch.toUpperCase()} BRANCH TIMINGS
    </small>

    <strong>
      {gymBranch === 'Kalyanpur' ? (
        <>
          6:00 AM — 12:00 PM
          <br />
          4:00 PM — 10:00 PM
        </>
      ) : gymBranch === 'Gopalpur' ? (
        <>
          6:00 AM — 11:00 AM
          <br />
          4:00 PM — 10:00 PM
        </>
      ) : (
        <>
          Please select a gym branch.
        </>
      )}
    </strong>

  </div>

</div>
            {/* =============================================
                WHATSAPP
            ============================================= */}

            <div className="contact-info-item">

              <span>📞</span>

              <div>

                <small>
                  WHATSAPP
                </small>

                <strong>

                  <a
                    href="https://wa.me/918927100145"
                    target="_blank"
                    rel="noreferrer"
                  >
                    89271-00145
                  </a>

                  {' / '}

                  <a
                    href="https://wa.me/917387766912"
                    target="_blank"
                    rel="noreferrer"
                  >
                    73877-66912
                  </a>

                </strong>

              </div>

            </div>


            {/* =============================================
                EMAIL
            ============================================= */}

            <div className="contact-info-item">

              <span>✉️</span>

              <div>

                <small>
                  EMAIL
                </small>

                <strong>

                  <a href="mailto:alphagym.asn@gmail.com">
                    alphagym.asn@gmail.com
                  </a>

                </strong>

              </div>

            </div>


            {/* =============================================
                INSTAGRAM
            ============================================= */}

            <div className="contact-info-item">

              <span>📸</span>

              <div>

                <small>
                  INSTAGRAM
                </small>

                <strong>

                  <a
                    href="https://www.instagram.com/alpha_gym_asansol/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @alpha_gym_asansol
                  </a>

                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            RIGHT SIDE — CONTACT FORM
        =================================================== */}

        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >

          {/* =============================================
              NAME + PHONE
          ============================================= */}

          <div className="input-row">

            <div className="input-group">

              <label htmlFor="name">
                YOUR NAME
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formState.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />

            </div>


            <div className="input-group">

              <label htmlFor="phone">
                PHONE
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength="10"
                placeholder="10 digit number"
                value={formState.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
              />

            </div>

          </div>


          {/* =============================================
              GOAL
          ============================================= */}

          <div className="input-group">

            <label htmlFor="goal">
              GOAL
            </label>

            <select
              id="goal"
              name="goal"
              value={formState.goal}
              onChange={handleChange}
            >

              <option value="Muscle Building">
                Muscle Building
              </option>

              <option value="Fat Loss">
                Fat Loss
              </option>

              <option value="Strength">
                Strength
              </option>

              <option value="General Fitness">
                General Fitness
              </option>

            </select>

          </div>


          {/* =============================================
              MESSAGE
          ============================================= */}

          <div className="input-group">

            <label htmlFor="message">
              MESSAGE
            </label>

            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Tell us about your fitness goal..."
              value={formState.message}
              onChange={handleChange}
            />

          </div>


          {/* =============================================
              SUBMIT
          ============================================= */}

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >

            {isSubmitting
              ? 'SUBMITTING...'
              : 'BOOK FREE TRIAL'}

          </button>


          {/* =============================================
              FORM MESSAGE
          ============================================= */}

          {formMessage && (
            <div
              className="form-message"
              role="status"
              aria-live="polite"
            >
              {formMessage}
            </div>
          )}

        </form>

      </div>


      {/* =====================================================
          GOOGLE MAP
      ===================================================== */}

      <div className="container contact-maps">

        <div className="map-heading">

          <div className="section-tag">
            FIND US
          </div>

          <h3>
            OUR <span>LOCATION.</span>
          </h3>

          <p>
            Visit Alpha Gym at our {locationData.branchName.toLowerCase()} branch.
          </p>

        </div>


        <div className="maps-grid">

          {/* ===============================================
              CURRENT BRANCH MAP
          =============================================== */}

          <div className="map-card">

            <div className="map-card-header">

              <span>
                01
              </span>

              <div>

                <small>
                  ALPHA GYM
                </small>

                <h4>
                  {locationData.branchName}
                </h4>

              </div>

            </div>


            <iframe
              title={locationData.mapTitle}
              src={locationData.mapUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />


            <div className="map-address">
              {locationData.shortAddress}
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}