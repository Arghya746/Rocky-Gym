const faqs = [
  {
    question: 'WHAT MEMBERSHIP PLANS DO YOU OFFER?',
    answer:
      'Alpha Gym offers flexible membership options including monthly, 6-month and annual plans. Contact us for the latest pricing and available offers.',
  },
  {
    question: 'WHAT ARE THE GYM TIMINGS?',
    answer:
      'Our gym timings may vary by location. Please contact Alpha Gym to confirm the latest opening and closing hours for your preferred location.',
  },
  {
    question: 'DO YOU PROVIDE PERSONAL TRAINING?',
    answer:
      'Yes. Personal training is available for members who want individual guidance, proper exercise techniques and goal-based workout planning.',
  },
  {
    question: 'CAN BEGINNERS JOIN ALPHA GYM?',
    answer:
      'Absolutely. Alpha Gym welcomes beginners as well as experienced members. Our trainers can help you understand exercises and build a structured routine.',
  },
  {
    question: 'IS ALPHA GYM UNISEX?',
    answer:
      'Yes. Alpha Gym is a unisex fitness environment where members can train comfortably and safely.',
  },
  {
    question: 'DO I NEED A PERSONAL TRAINER TO JOIN?',
    answer:
      'No. Personal training is optional. You can train independently or choose trainer guidance depending on your fitness goals and requirements.',
  },
  {
    question: 'CAN I VISIT THE GYM BEFORE TAKING MEMBERSHIP?',
    answer:
      'For trial visits or membership enquiries, please contact Alpha Gym directly to check the currently available options.',
  },
  {
    question: 'HOW CAN I CONTACT ALPHA GYM?',
    answer:
      'You can contact Alpha Gym through the contact section of this website for membership enquiries, location details and other information.',
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="section faq-section">
      <div className="container">
        <div className="section-heading faq-heading">
          <div className="section-tag">GOT QUESTIONS?</div>

          <h2>
            FREQUENTLY
            <span> ASKED.</span>
          </h2>

          <p>
            Everything you need to know before starting your fitness journey
            with Alpha Gym.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details className="faq-item" key={index}>
              <summary>
                <span className="faq-number">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="faq-question">
                  {faq.question}
                </span>

                <span className="faq-icon">+</span>
              </summary>

              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="faq-cta">
          <div>
            <span>STILL HAVE QUESTIONS?</span>

            <h3>
              LET'S GET
              <strong> YOU STARTED.</strong>
            </h3>
          </div>

          <a href="#contact">
            CONTACT ALPHA GYM <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}