import React from 'react';

import kalyanpurGallery1 from '../assets/Kalyanpur gallery 1.jpeg';
import kalyanpurGallery2 from '../assets/Kalyanpur gallery 2.jpeg';
import kalyanpurGallery3 from '../assets/Kalyanpur gallery 3.jpeg';

import gopalpurGallery1 from '../assets/Gopalpur gallery 1.jpeg';
import gopalpurGallery2 from '../assets/Gopalpur gallery 2.jpeg';
import gopalpurGallery3 from '../assets/Gopalpur gallery 3.jpeg';
import gopalpurGallery4 from '../assets/Gopalpur gallery 4.jpeg';
import gopalpurGallery5 from '../assets/Gopalpur gallery 5.jpeg';


/* =========================================================
   KALYANPUR GALLERY
   ========================================================= */

const kalyanpurGalleryItems = [
  {
    id: 'kalyanpur-gallery-1',
    title: 'TRAINING AREA',
    category: 'GYM FLOOR',
    image: kalyanpurGallery1,
  },
  {
    id: 'kalyanpur-gallery-2',
    title: 'STRENGTH ZONE',
    category: 'STRENGTH',
    image: kalyanpurGallery2,
  },
  {
    id: 'kalyanpur-gallery-3',
    title: 'CARDIO AREA',
    category: 'CARDIO',
    image: kalyanpurGallery3,
  },
];


/* =========================================================
   GOPALPUR GALLERY
   ========================================================= */

const gopalpurGalleryItems = [
  {
    id: 'gopalpur-gallery-1',
    title: 'TRAINING AREA',
    category: 'GYM FLOOR',
    image: gopalpurGallery1,
  },
  {
    id: 'gopalpur-gallery-2',
    title: 'STRENGTH ZONE',
    category: 'STRENGTH',
    image: gopalpurGallery2,
  },
  {
    id: 'gopalpur-gallery-3',
    title: 'CARDIO AREA',
    category: 'CARDIO',
    image: gopalpurGallery3,
  },
  {
    id: 'gopalpur-gallery-4',
    title: 'WORKOUT SPACE',
    category: 'FITNESS',
    image: gopalpurGallery4,
  },
  {
    id: 'gopalpur-gallery-5',
    title: 'EQUIPMENT',
    category: 'TRAINING',
    image: gopalpurGallery5,
  },
];


/* =========================================================
   GALLERY SECTION
   ========================================================= */

export default function GallerySection({ branchConfig }) {

  const rawBranchName =
    branchConfig?.gym?.branchName ||
    branchConfig?.name ||
    branchConfig?.branchName ||
    'Kalyanpur';

  const branchName = String(rawBranchName).trim();

  const normalizedBranch = branchName
    .toLowerCase()
    .replace(/\s+/g, '');

  const isGopalpur = normalizedBranch.includes('gopalpur');

  const displayName =
    branchConfig?.gym?.displayName ||
    branchConfig?.displayName ||
    `Alpha Gym ${branchName}`;


  /* ---------------------------------------------------------
     SELECT BRANCH GALLERY
     --------------------------------------------------------- */

  const branchGallery = isGopalpur
    ? gopalpurGalleryItems
    : kalyanpurGalleryItems;


  /* ---------------------------------------------------------
     CUSTOM GALLERY SUPPORT
     --------------------------------------------------------- */

  const customGallery =
    Array.isArray(branchConfig?.gallery) &&
    branchConfig.gallery.length > 0
      ? branchConfig.gallery.filter((item) => item?.image)
      : [];


  const galleryItems =
    customGallery.length > 0
      ? customGallery
      : branchGallery;


  return (
    <section
      id="gallery"
      className="section gallery-section"
      data-branch={branchConfig?.id || normalizedBranch}
    >

      <div className="container">

        {/* =====================================================
            HEADING
            ===================================================== */}

        <div className="section-heading gallery-heading">

          <div className="section-tag">
            {displayName.toUpperCase()} GALLERY
          </div>

          <h2>
            SEE THE<span> GRIND.</span>
          </h2>

          <p>
            Take a look at the training environment, equipment and
            spaces where {branchName} members work hard and make
            progress every day.
          </p>

        </div>


        {/* =====================================================
            GALLERY GRID
            ===================================================== */}

        <div
          className={`gallery-grid ${
            isGopalpur
              ? 'gallery-gopalpur'
              : 'gallery-kalyanpur'
          }`}
        >

          {galleryItems.map((item, index) => (

            <div
              key={
                item.id ||
                `${item.title || 'gallery'}-${index}`
              }
              className="gallery-card"
            >

              {/* -------------------------------------------------
                  IMAGE
                  ------------------------------------------------- */}

              <div className="gallery-image-box">

                {item.image ? (

                  <img
                    src={item.image}
                    alt={`${item.title || 'Gym'} at ${displayName}`}
                    className="gallery-image"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />

                ) : (

                  <div className="gallery-placeholder">

                    <span className="gallery-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                  </div>

                )}

              </div>


              {/* -------------------------------------------------
                  TEXT BELOW IMAGE
                  ------------------------------------------------- */}

              <div className="gallery-card-info">

                <span className="gallery-card-category">
                  {item.category || 'ALPHA GYM'}
                </span>

                <h3>
                  {item.title || 'ALPHA GYM'}
                </h3>

              </div>

            </div>

          ))}

        </div>


        {/* =====================================================
            BOTTOM TEXT
            ===================================================== */}

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