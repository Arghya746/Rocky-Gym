import { useState } from 'react';

export default function ContactSection() {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    goal: 'Muscle Building',
    message: '',
  });

  const [formMessage, setFormMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { name, phone, goal, message } = formState;

    if (!name.trim() || !phone.trim()) {
      setFormMessage('Please enter your name and phone number.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setFormMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      setFormMessage('Submitting your enquiry...');

      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          goal,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      setFormMessage(
        `Thanks ${name.trim()}! Your ${goal.toLowerCase()} enquiry has been submitted successfully.`
      );

      setFormState({
        name: '',
        phone: '',
        goal: 'Muscle Building',
        message: '',
      });
    } catch (error) {
      console.error('Contact form error:', error);

      setFormMessage(
        'Unable to submit your enquiry. Please try again.'
      );
    }
  };

  return (
    <section id="contact" className="section contact-section">

      {/* =========================================
          CONTACT INFORMATION + FORM
      ========================================= */}

      <div className="container contact-grid">

        {/* LEFT SIDE */}
        <div className="contact-left">

          <div className="section-tag">START TODAY</div>

          <h2>
            READY TO
            <span>TRAIN?</span>
          </h2>

          <p>
            Book a free trial session and experience the Alpha Gym environment.
          </p>

          <div className="contact-info">

            {/* LOCATION 1 */}
            <div className="contact-info-item">
              <span>📍</span>

              <div>
                <small>LOCATION 1 — KALYANPUR</small>

                <strong>
                  1st Floor, Anudeep Apartment, Plot 43,
                  Shakespeare Sarani, Kalyanpur Housing,
                  Asansol - 713305
                  <br />
                  (Near Kalyanpur Adi Durgapuja Pandal)
                </strong>
              </div>
            </div>

            {/* LOCATION 2 */}
            <div className="contact-info-item">
              <span>📍</span>

              <div>
                <small>LOCATION 2 — CHELIDANGA</small>

                <strong>
                  2nd Floor, Rozi Niwas, Mother Teresa Road,
                  Chelidanga, Asansol - 713304
                  <br />
                  (Above Wine Shop, Opposite Pizza Xpress Pizzeria)
                </strong>
              </div>
            </div>

            {/* TIMINGS */}
            <div className="contact-info-item">
              <span>🕐</span>

              <div>
                <small>GYM TIMINGS</small>

                <strong>
                  Kalyanpur: 6:00 AM — 12:00 PM
                  <br />
                  4:00 PM — 10:00 PM
                  <br />
                  <br />
                  Gopalpur: 6:00 AM — 11:00 AM
                  <br />
                  4:00 PM — 10:00 PM
                </strong>
              </div>
            </div>

            {/* WHATSAPP */}
            <div className="contact-info-item">
              <span>📞</span>

              <div>
                <small>WHATSAPP</small>

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

            {/* EMAIL */}
            <div className="contact-info-item">
              <span>✉️</span>

              <div>
                <small>EMAIL</small>

                <strong>
                  <a href="mailto:alphagym.asn@gmail.com">
                    alphagym.asn@gmail.com
                  </a>
                </strong>
              </div>
            </div>

            {/* INSTAGRAM */}
            <div className="contact-info-item">
              <span>📸</span>

              <div>
                <small>INSTAGRAM</small>

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


        {/* =========================================
            RIGHT SIDE — CONTACT FORM
        ========================================= */}

        <form className="contact-form" onSubmit={handleSubmit}>

          <div className="input-row">

            {/* NAME */}
            <div className="input-group">
              <label htmlFor="name">YOUR NAME</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formState.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* PHONE */}
            <div className="input-group">
              <label htmlFor="phone">PHONE</label>

              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength="10"
                placeholder="10 digit number"
                value={formState.phone}
                onChange={handleChange}
                required
              />
            </div>

          </div>


          {/* GOAL */}
          <div className="input-group">
            <label htmlFor="goal">GOAL</label>

            <select
              id="goal"
              name="goal"
              value={formState.goal}
              onChange={handleChange}
            >
              <option>Muscle Building</option>
              <option>Fat Loss</option>
              <option>Strength</option>
              <option>General Fitness</option>
            </select>
          </div>


          {/* MESSAGE */}
          <div className="input-group">
            <label htmlFor="message">MESSAGE</label>

            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Tell us about your fitness goal..."
              value={formState.message}
              onChange={handleChange}
            />
          </div>


          {/* SUBMIT */}
          <button type="submit" className="submit-btn">
            BOOK FREE TRIAL
          </button>


          {/* FORM MESSAGE */}
          {formMessage && (
            <div className="form-message">
              {formMessage}
            </div>
          )}

        </form>

      </div>


      {/* =========================================
          GOOGLE MAPS — BOTTOM OF CONTACT SECTION
      ========================================= */}

      <div className="container contact-maps">

        <div className="map-heading">

          <div className="section-tag">FIND US</div>

          <h3>
            OUR <span>LOCATIONS.</span>
          </h3>

          <p>
            Visit Alpha Gym at either of our Asansol locations.
          </p>

        </div>


        <div className="maps-grid">

          {/* =====================================
              KALYANPUR MAP
          ===================================== */}

          <div className="map-card">

            <div className="map-card-header">
              <span>01</span>

              <div>
                <small>ALPHA GYM</small>
                <h4>KALYANPUR</h4>
              </div>
            </div>

            <iframe
              title="Alpha Gym Kalyanpur Asansol"
              src="https://www.google.com/maps?q=Alpha%20Gym%20Kalyanpur%20Asansol&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="map-address">
              1st Floor, Anudeep Apartment, Plot 43,
              Shakespeare Sarani, Kalyanpur Housing,
              Asansol - 713305
            </div>

          </div>


          {/* =====================================
              CHELIDANGA MAP
          ===================================== */}

          <div className="map-card">

            <div className="map-card-header">
              <span>02</span>

              <div>
                <small>ALPHA GYM</small>
                <h4>CHELIDANGA</h4>
              </div>
            </div>

            <iframe
              title="Alpha Gym Chelidanga Asansol"
              src="https://www.google.com/maps?q=Alpha%20Gym%20Chelidanga%20Asansol&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="map-address">
              2nd Floor, Rozi Niwas, Mother Teresa Road,
              Chelidanga, Asansol - 713304
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}