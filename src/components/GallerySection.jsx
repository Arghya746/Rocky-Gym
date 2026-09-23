const defaultGalleryItems = [
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

export default function GallerySection({ branchConfig }) {
  const branchName =
    branchConfig?.gym?.branchName ||
    branchConfig?.name ||
    'Alpha Gym';

  const displayName =
    branchConfig?.gym?.displayName ||
    `Alpha Gym ${branchName}`;

  const galleryItems =
    Array.isArray(branchConfig?.gallery) &&
    branchConfig.gallery.length > 0
      ? branchConfig.gallery
      : defaultGalleryItems;

  return (
    <section
      id="gallery"
      className="section gallery-section"
      data-branch={branchConfig?.id || ''}
    >
      <div className="container">

        {/* SECTION HEADING */}
        <div className="section-heading gallery-heading">
          <div className="section-tag">
            {displayName.toUpperCase()} GALLERY
          </div>

          <h2>
            SEE THE
            <span> GRIND.</span>
          </h2>

          <p>
            Take a look at the training environment, equipment and spaces
            where {branchName} members work hard and make progress every day.
          </p>
        </div>

        {/* GALLERY GRID */}
        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <div
              key={item.id || `${item.title}-${index}`}
              className={`gallery-item ${item.className || ''}`}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={`${item.title} at ${displayName}`}
                  className="gallery-image"
                />
              ) : (
                <div className="gallery-placeholder">
                  <span className="gallery-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="gallery-overlay">
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
                  </div>
                </div>
              )}

              {/* Overlay for actual images */}
              {item.image && (
                <div className="gallery-overlay">
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                </div>
              )}
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