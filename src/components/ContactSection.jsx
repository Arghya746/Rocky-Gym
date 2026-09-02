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
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { name, phone } = formState;

    if (!name.trim() || !phone.trim()) {
      setFormMessage('Please enter your name and phone number.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setFormMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setFormMessage(`Thanks ${name.trim()}! Your ${formState.goal.toLowerCase()} enquiry has been recorded in this demo.`);

    setFormState({
      name: '',
      phone: '',
      goal: 'Muscle Building',
      message: '',
    });
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="container contact-grid">
        <div>
          <div className="section-tag">START TODAY</div>

          <h2>
            READY TO
            <span>TRAIN?</span>
          </h2>

          <p>
            Book a free trial session and experience the Fitness Point environment.
          </p>

          <div className="contact-info">
            <div>
              <span>📍</span>
              <div>
                <small>LOCATION 1</small>
                <strong>
                  1st Floor, Anudeep Apartment, Plot 43, Shakespeare Sarani, Kalyanpur Housing,
                  Asansol - 713305 (Near Kalyanpur Adi Durgapuja Pandal)
                </strong>
              </div>
            </div>

            <div>
              <span>📍</span>
              <div>
                <small>LOCATION 2</small>
                <strong>
                  2nd Floor, Rozi Niwas, Mother Teresa Road, Chelidanga, Asansol - 713304
                  (Above Wine Shop, Opposite Pizza Xpress Pizzeria)
                </strong>
              </div>
            </div>

            <div>
              <span>🕐</span>
              <div>
                <small>HOURS</small>
                <strong>5:00 AM — 10:00 PM*</strong>
              </div>
            </div>

            <div>
              <span>📞</span>
              <div>
                <small>WHATSAPP</small>
                <strong>
                  <a href="https://wa.me/918927100145" target="_blank" rel="noreferrer">
                    89271-00145
                  </a>{' '}
                  /{' '}
                  <a href="https://wa.me/917387766912" target="_blank" rel="noreferrer">
                    73877-66912
                  </a>
                </strong>
              </div>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="input-row">
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

            <div className="input-group">
              <label htmlFor="phone">PHONE</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="10 digit number"
                value={formState.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="goal">GOAL</label>
            <select id="goal" name="goal" value={formState.goal} onChange={handleChange}>
              <option>Muscle Building</option>
              <option>Fat Loss</option>
              <option>Strength</option>
              <option>General Fitness</option>
            </select>
          </div>

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

          <button type="submit" className="submit-btn">
            BOOK FREE TRIAL
          </button>

          {formMessage && <div className="form-message">{formMessage}</div>}
        </form>
      </div>
    </section>
  );
}
