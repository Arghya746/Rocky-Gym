const testimonials = [
  {
    quote: 'Great environment and the equipment selection makes every workout enjoyable.',
    name: 'RAHUL B.',
    type: 'MEMBER',
  },
  {
    quote: 'The biggest difference is consistency. Once you start tracking your progress, you do not want to stop.',
    name: 'PRIYA S.',
    type: 'MEMBER',
    featured: true,
  },
  {
    quote: 'A focused gym environment with trainers who actually pay attention to your form.',
    name: 'AMIT R.',
    type: 'MEMBER',
  },
];

export default function TestimonialSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-heading centered">
          <div className="section-tag">MEMBER EXPERIENCE</div>
          <h2>
            BUILT FOR
            <span>RESULTS.</span>
          </h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.name} className={`testimonial ${item.featured ? 'featured-testimonial' : ''}`}>
              <div className="quote">“</div>
              <p>{item.quote}</p>
              <strong>{item.name}</strong>
              <span>{item.type}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
