const galleryItems = [
  {
    title: 'TRAINING AREA',
    category: 'GYM FLOOR',
    className: 'gallery-large',
  },
  {
    title: 'STRENGTH ZONE',
    category: 'STRENGTH',
    className: 'gallery-tall',
  },
  {
    title: 'CARDIO AREA',
    category: 'CARDIO',
    className: '',
  },
  {
    title: 'WORKOUT SPACE',
    category: 'FITNESS',
    className: '',
  },
  {
    title: 'EQUIPMENT',
    category: 'TRAINING',
    className: 'gallery-wide',
  },
  {
    title: 'ALPHA GYM',
    category: 'FACILITY',
    className: '',
  },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="section gallery-section">
      <div className="container">

        {/* SECTION HEADING */}
        <div className="section-heading gallery-heading">
          <div className="section-tag">ALPHA GYM GALLERY</div>

          <h2>
            SEE THE
            <span> GRIND.</span>
          </h2>

          <p>
            Take a look at the training environment, equipment and spaces
            where Alpha members work hard and make progress every day.
          </p>
        </div>

        {/* GALLERY GRID */}
        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              className={`gallery-item ${item.className}`}
            >
              {/* Temporary visual area */}
              <div className="gallery-placeholder">
                <span className="gallery-number">
                  0{index + 1}
                </span>

                <div className="gallery-overlay">
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM TEXT */}
        <div className="gallery-bottom">
          <span>TRAIN HARD</span>
          <span>•</span>
          <span>STAY CONSISTENT</span>
          <span>•</span>
          <span>GET STRONGER</span>
        </div>

      </div>
    </section>
  );
}