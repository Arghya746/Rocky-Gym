import { useEffect, useState } from 'react';

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import './App.css';

/* =========================================================
   TRAINER ASSETS
   ========================================================= */

import akramTrainerImage from './assets/Akram trainer.jpeg';
import shariqueTrainerImage from './assets/Sharique trainer.jpeg';
import nikitaTrainerImage from './assets/Nikita Trainer.jpeg';

/* =========================================================
   PUBLIC COMPONENTS
   ========================================================= */

import AboutUsSection from './components/AboutUsSection';
import ContactSection from './components/ContactSection';
import FAQSection from './components/FAQSection';
import GallerySection from './components/GallerySection';
import GymSelection from './components/GymSelection';
import Hero from './components/Hero';
import HomeIntro from './components/HomeIntro';
import Marquee from './components/Marquee';
import MotivationSection from './components/MotivationSection';
import Navbar from './components/Navbar';
import OffersSection from './components/OffersSection';
import ServicesSection from './components/ServicesSection';
import SoftwareSection from './components/SoftwareSection';
import TestimonialSection from './components/TestimonialSection';
import TimingsSection from './components/TimingsSection';
import TrainersSection from './components/TrainersSection';

/* =========================================================
   ADMIN / AUTH
   ========================================================= */

import ProtectedRoute from './components/ProtectedRoute';

import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import MemberDetails from './pages/MemberDetails';
import PaymentReceipt from './pages/PaymentReceipt';

/* =========================================================
   WEBSITE URL
   ========================================================= */

const WEBSITE_URL = 'https://rocky-gym-mj6j.vercel.app';

/* =========================================================
   SHARED BRANCH CONFIGURATION
   =========================================================

   IMPORTANT:
   Do NOT export BRANCH_CONFIG from App.jsx.

   This avoids the Vite Fast Refresh warning:
   "BRANCH_CONFIG export is incompatible"
   ========================================================= */

const BRANCH_CONFIG = {
  /* =======================================================
     KALYANPUR
     ======================================================= */

  kalyanpur: {
    id: 'kalyanpur',

    name: 'Kalyanpur',

    slug: 'kalyanpur',

    title: 'Alpha Gym Kalyanpur | Asansol',

    description:
      'Alpha Gym Kalyanpur in Asansol — gym information, trainers, membership offers, gallery, timings and contact details.',

    /* -------------------------------------------------------
       GYM INFORMATION
    ------------------------------------------------------- */

    gym: {
      name: 'Alpha Gym',

      branchName: 'Kalyanpur',

      displayName: 'Alpha Gym Kalyanpur',

      photo: '',

      tagline: 'TRAIN HARD • LIVE STRONG',

      description:
        'Premium fitness training and gym facilities at our Kalyanpur branch.',
    },

    /* -------------------------------------------------------
       OWNER
    ------------------------------------------------------- */

    owner: {
      name: '',
      photo: '',
      phone: '',
      email: '',
    },

    /* -------------------------------------------------------
       ADMIN
    ------------------------------------------------------- */

    admin: {
      name: '',
      photo: '',
      email: '',
      phone: '',
    },

    /* -------------------------------------------------------
       TRAINERS

       KALYANPUR:
       1. Sharique
       2. Nikita
    ------------------------------------------------------- */

    trainers: [
      {
        id: 'kalyanpur-trainer-1',

        name: 'Sharique',

        role: 'FITNESS & PERSONAL TRAINING COACH',

        image: shariqueTrainerImage,

        photo: shariqueTrainerImage,

        experience: 'EXPERIENCED TRAINER',

        specialization: 'FITNESS TRAINING',

        className: 'trainer-cyan',
      },

      {
        id: 'kalyanpur-trainer-2',

        name: 'Nikita',

        role: 'FITNESS & PERSONAL TRAINING COACH',

        image: nikitaTrainerImage,

        photo: nikitaTrainerImage,

        experience: 'EXPERIENCED TRAINER',

        specialization: 'PERSONAL TRAINING',

        className: 'trainer-purple',
      },
    ],

    /* -------------------------------------------------------
       OFFERS
    ------------------------------------------------------- */

    offers: [
      {
        id: 'kalyanpur-quarterly-offer',

        name: 'Quarterly',

        title: 'QUARTERLY',

        durationMonths: 3,

        offerPrice: 2499,

        price: 2499,

        description:
          'Special quarterly membership offer available for a limited time.',

        benefits: [
          'Full Gym Access',
          'Workout Plan',
          'Digital Member Profile',
          'Progress Tracking',
        ],

        validUntil: '',
      },
    ],

    /* -------------------------------------------------------
       CONTACT
    ------------------------------------------------------- */

    contact: {
      phone: '89271-00145',

      alternatePhone: '73877-66912',

      email: 'alphagym.asn@gmail.com',

      whatsapp: '89271-00145',

      instagram: '@alpha_gym_asansol',

      address:
        '1st Floor, Anudeep Apartment, Plot 43, Shakespeare Sarani, Kalyanpur Housing, Asansol - 713305',

      city: 'Asansol',

      state: 'West Bengal',

      country: 'India',
    },

    /* -------------------------------------------------------
       LOCATION
    ------------------------------------------------------- */

    location: {
      address:
        '1st Floor, Anudeep Apartment, Plot 43, Shakespeare Sarani, Kalyanpur Housing, Asansol - 713305',

      landmark:
        'Near Kalyanpur Adi Durgapuja Pandal',

      city: 'Asansol',

      state: 'West Bengal',

      country: 'India',

      mapUrl: '',

      latitude: '',

      longitude: '',
    },

    /* -------------------------------------------------------
       TIMINGS
    ------------------------------------------------------- */

    timings: {
      morning: '6:00 AM – 12:00 PM',

      evening: '4:00 PM – 10:00 PM',

      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },

    /* -------------------------------------------------------
       GALLERY
    ------------------------------------------------------- */

    gallery: [
      {
        id: 'kalyanpur-gallery-1',
        image: '',
        title: '',
      },

      {
        id: 'kalyanpur-gallery-2',
        image: '',
        title: '',
      },

      {
        id: 'kalyanpur-gallery-3',
        image: '',
        title: '',
      },

      {
        id: 'kalyanpur-gallery-4',
        image: '',
        title: '',
      },
    ],
  },

  /* =======================================================
     GOPALPUR
     ======================================================= */

  gopalpur: {
    id: 'gopalpur',

    name: 'Gopalpur',

    slug: 'gopalpur',

    title: 'Alpha Gym Gopalpur | Asansol',

    description:
      'Alpha Gym Gopalpur in Asansol — gym information, trainers, membership offers, gallery, timings and contact details.',

    /* -------------------------------------------------------
       GYM INFORMATION
    ------------------------------------------------------- */

    gym: {
      name: 'Alpha Gym',

      branchName: 'Gopalpur',

      displayName: 'Alpha Gym Gopalpur',

      photo: '',

      tagline: 'TRAIN HARD • LIVE STRONG',

      description:
        'Premium fitness training and gym facilities at our Gopalpur branch.',
    },

    /* -------------------------------------------------------
       OWNER
    ------------------------------------------------------- */

    owner: {
      name: '',
      photo: '',
      phone: '',
      email: '',
    },

    /* -------------------------------------------------------
       ADMIN
    ------------------------------------------------------- */

    admin: {
      name: '',
      photo: '',
      email: '',
      phone: '',
    },

    /* -------------------------------------------------------
       TRAINERS

       GOPALPUR:
       1. Akram
       2. Nikita
    ------------------------------------------------------- */

    trainers: [
      {
        id: 'gopalpur-trainer-1',

        name: 'Akram',

        role: 'STRENGTH & FITNESS COACH',

        image: akramTrainerImage,

        photo: akramTrainerImage,

        experience: 'EXPERIENCED TRAINER',

        specialization: 'STRENGTH & FITNESS',

        className: 'trainer-orange',
      },

      {
        id: 'gopalpur-trainer-2',

        name: 'Nikita',

        role: 'FITNESS & PERSONAL TRAINING COACH',

        image: nikitaTrainerImage,

        photo: nikitaTrainerImage,

        experience: 'EXPERIENCED TRAINER',

        specialization: 'PERSONAL TRAINING',

        className: 'trainer-purple',
      },
    ],

    /* -------------------------------------------------------
       OFFERS
    ------------------------------------------------------- */

    offers: [
      {
        id: 'gopalpur-quarterly-offer',

        name: 'Quarterly',

        title: 'QUARTERLY',

        durationMonths: 3,

        offerPrice: 2499,

        price: 2499,

        description:
          'Special quarterly membership offer available for a limited time.',

        benefits: [
          'Full Gym Access',
          'Workout Plan',
          'Digital Member Profile',
          'Progress Tracking',
        ],

        validUntil: '',
      },
    ],

    /* -------------------------------------------------------
       CONTACT
    ------------------------------------------------------- */

    contact: {
      phone: '89271-00145',

      alternatePhone: '73877-66912',

      email: 'alphagym.asn@gmail.com',

      whatsapp: '89271-00145',

      instagram: '@alpha_gym_asansol',

      address:
        '2nd Floor, Rozi Niwas, Mother Teresa Road, Chelidanga, Asansol - 713304',

      city: 'Asansol',

      state: 'West Bengal',

      country: 'India',
    },

    /* -------------------------------------------------------
       LOCATION
    ------------------------------------------------------- */

    location: {
      address:
        '2nd Floor, Rozi Niwas, Mother Teresa Road, Chelidanga, Asansol - 713304',

      landmark:
        'Above Wine Shop, Opposite Pizza Xpress Pizzeria',

      city: 'Asansol',

      state: 'West Bengal',

      country: 'India',

      mapUrl: '',

      latitude: '',

      longitude: '',
    },

    /* -------------------------------------------------------
       TIMINGS
    ------------------------------------------------------- */

    timings: {
      morning: '6:00 AM – 11:00 AM',

      evening: '4:00 PM – 10:00 PM',

      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },

    /* -------------------------------------------------------
       GALLERY
    ------------------------------------------------------- */

    gallery: [
      {
        id: 'gopalpur-gallery-1',
        image: '',
        title: '',
      },

      {
        id: 'gopalpur-gallery-2',
        image: '',
        title: '',
      },

      {
        id: 'gopalpur-gallery-3',
        image: '',
        title: '',
      },

      {
        id: 'gopalpur-gallery-4',
        image: '',
        title: '',
      },
    ],
  },
};

/* =========================================================
   PUBLIC HOME PAGE
   ========================================================= */

function HomePage({
  branchConfig,
  onClaimOffer,
  theme,
  onToggleTheme,
}) {
  return (
    <>
      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar
        theme={theme}
        onToggleTheme={onToggleTheme}
        branchConfig={branchConfig}
      />

      <main>
        {/* =================================================
            HERO
        ================================================= */}

        <Hero branchConfig={branchConfig} />

        {/* =================================================
            MARQUEE
        ================================================= */}

        <Marquee branchConfig={branchConfig} />

        {/* =================================================
            HOME INTRO
        ================================================= */}

        <HomeIntro branchConfig={branchConfig} />

        {/* =================================================
            ABOUT
        ================================================= */}

        <AboutUsSection branchConfig={branchConfig} />

        {/* =================================================
            SERVICES
        ================================================= */}

        <ServicesSection branchConfig={branchConfig} />

        {/* =================================================
            TIMINGS
        ================================================= */}

        <TimingsSection branchConfig={branchConfig} />

        {/* =================================================
            GALLERY
        ================================================= */}

        <GallerySection branchConfig={branchConfig} />

        {/* =================================================
            TRAINERS
        ================================================= */}

        <TrainersSection branchConfig={branchConfig} />

        {/* =================================================
            OFFERS
        ================================================= */}

        <OffersSection
          branchConfig={branchConfig}
          onClaimOffer={onClaimOffer}
        />

        {/* =================================================
            SOFTWARE
        ================================================= */}

        <SoftwareSection branchConfig={branchConfig} />

        {/* =================================================
            MOTIVATION
        ================================================= */}

        <MotivationSection branchConfig={branchConfig} />

        {/* =================================================
            TESTIMONIALS
        ================================================= */}

        <TestimonialSection branchConfig={branchConfig} />

        {/* =================================================
            FAQ
        ================================================= */}

        <FAQSection branchConfig={branchConfig} />

        {/* =================================================
            CONTACT
        ================================================= */}

        <ContactSection branchConfig={branchConfig} />
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>
        <div className="container footer-content">
          <p>
            © 2026 {branchConfig.gym.displayName}
            {' '}• Premium fitness experience
          </p>

          <span>{branchConfig.gym.tagline}</span>
        </div>

        <div className="container disclaimer">
          * Schedule and offers may vary. Please contact{' '}
          {branchConfig.gym.displayName}{' '}
          for the latest membership information.
        </div>
      </footer>

      {/* =====================================================
          TOAST
      ===================================================== */}

      <div
        id="toast"
        className="toast"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );
}

/* =========================================================
   SEO / ROUTE META
   ========================================================= */

function RouteMeta() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    const isAdminRoute = pathname.startsWith('/admin');

    let branchConfig = null;

    if (pathname === '/kalyanpur') {
      branchConfig = BRANCH_CONFIG.kalyanpur;
    }

    if (pathname === '/gopalpur') {
      branchConfig = BRANCH_CONFIG.gopalpur;
    }

    /* =====================================================
       ROUTE INFORMATION
    ===================================================== */

    let pageTitle = 'Alpha Gym | Asansol';

    let pageDescription =
      'Alpha Gym in Asansol with Kalyanpur and Gopalpur branches, offering strength training, cardio, personal training and modern workout facilities.';

    let canonicalUrl = `${WEBSITE_URL}/`;

    if (branchConfig) {
      pageTitle = branchConfig.title;

      pageDescription = branchConfig.description;

      canonicalUrl = `${WEBSITE_URL}/${branchConfig.slug}`;
    }

    if (pathname === '/admin/login') {
      pageTitle = 'Admin Login • Alpha Gym';

      pageDescription =
        'Secure Alpha Gym administration login.';
    }

    if (isAdminRoute && pathname !== '/admin/login') {
      pageTitle = 'Admin Dashboard • Alpha Gym';

      pageDescription =
        'Alpha Gym administration dashboard.';
    }

    /* =====================================================
       ROBOTS
    ===================================================== */

    let robotsMeta = document.querySelector(
      'meta[name="robots"]'
    );

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');

      robotsMeta.setAttribute(
        'name',
        'robots'
      );

      document.head.appendChild(robotsMeta);
    }

    robotsMeta.setAttribute(
      'content',
      isAdminRoute
        ? 'noindex, nofollow, noarchive'
        : 'index, follow'
    );

    /* =====================================================
       TITLE
    ===================================================== */

    document.title = pageTitle;

    /* =====================================================
       DESCRIPTION
    ===================================================== */

    let descriptionMeta = document.querySelector(
      'meta[name="description"]'
    );

    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');

      descriptionMeta.setAttribute(
        'name',
        'description'
      );

      document.head.appendChild(descriptionMeta);
    }

    descriptionMeta.setAttribute(
      'content',
      pageDescription
    );

    /* =====================================================
       CANONICAL
    ===================================================== */

    let canonicalLink = document.querySelector(
      'link[rel="canonical"]'
    );

    if (!canonicalLink) {
      canonicalLink = document.createElement('link');

      canonicalLink.setAttribute(
        'rel',
        'canonical'
      );

      document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute(
      'href',
      canonicalUrl
    );

    /* =====================================================
       OPEN GRAPH — TITLE
    ===================================================== */

    let ogTitle = document.querySelector(
      'meta[property="og:title"]'
    );

    if (!ogTitle) {
      ogTitle = document.createElement('meta');

      ogTitle.setAttribute(
        'property',
        'og:title'
      );

      document.head.appendChild(ogTitle);
    }

    ogTitle.setAttribute(
      'content',
      pageTitle
    );

    /* =====================================================
       OPEN GRAPH — DESCRIPTION
    ===================================================== */

    let ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );

    if (!ogDescription) {
      ogDescription = document.createElement('meta');

      ogDescription.setAttribute(
        'property',
        'og:description'
      );

      document.head.appendChild(ogDescription);
    }

    ogDescription.setAttribute(
      'content',
      pageDescription
    );

    /* =====================================================
       OPEN GRAPH — URL
    ===================================================== */

    let ogUrl = document.querySelector(
      'meta[property="og:url"]'
    );

    if (!ogUrl) {
      ogUrl = document.createElement('meta');

      ogUrl.setAttribute(
        'property',
        'og:url'
      );

      document.head.appendChild(ogUrl);
    }

    ogUrl.setAttribute(
      'content',
      canonicalUrl
    );

    /* =====================================================
       OPEN GRAPH — SITE NAME
    ===================================================== */

    let ogSiteName = document.querySelector(
      'meta[property="og:site_name"]'
    );

    if (!ogSiteName) {
      ogSiteName = document.createElement('meta');

      ogSiteName.setAttribute(
        'property',
        'og:site_name'
      );

      document.head.appendChild(ogSiteName);
    }

    ogSiteName.setAttribute(
      'content',
      'Alpha Gym | Asansol'
    );

    /* =====================================================
       OPEN GRAPH — TYPE
    ===================================================== */

    let ogType = document.querySelector(
      'meta[property="og:type"]'
    );

    if (!ogType) {
      ogType = document.createElement('meta');

      ogType.setAttribute(
        'property',
        'og:type'
      );

      document.head.appendChild(ogType);
    }

    ogType.setAttribute(
      'content',
      'website'
    );

    /* =====================================================
       BRANCH STRUCTURED DATA
    =====================================================

       The main organization schema already exists in
       index.html.

       Here we add branch-specific schema dynamically
       when a user visits a branch page.
    */

    const existingBranchSchema = document.getElementById(
      'alpha-gym-branch-schema'
    );

    if (existingBranchSchema) {
      existingBranchSchema.remove();
    }

    if (branchConfig) {
      const branchSchema =
        document.createElement('script');

      branchSchema.id =
        'alpha-gym-branch-schema';

      branchSchema.type =
        'application/ld+json';

      const branchSchemaData = {
        '@context': 'https://schema.org',

        '@type': 'ExerciseGym',

        '@id': canonicalUrl,

        name: branchConfig.gym.displayName,

        url: canonicalUrl,

        description: pageDescription,

        telephone: branchConfig.contact.phone,

        address: {
          '@type': 'PostalAddress',

          streetAddress:
            branchConfig.location.address,

          addressLocality:
            branchConfig.location.city,

          addressRegion:
            branchConfig.location.state,

          postalCode:
            branchConfig.location.address.includes(
              '713305'
            )
              ? '713305'
              : '713304',

          addressCountry:
            branchConfig.location.country,
        },

        areaServed: {
          '@type': 'City',

          name: 'Asansol',
        },

        parentOrganization: {
          '@type': 'Organization',

          name: 'Alpha Gym | Asansol',

          url: WEBSITE_URL,
        },
      };

      branchSchema.textContent =
        JSON.stringify(branchSchemaData);

      document.head.appendChild(
        branchSchema
      );
    }
  }, [location.pathname]);

  return null;
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  /* =======================================================
     THEME STATE
  ======================================================= */

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem('fitness-theme') ||
      'dark'
    );
  });

  /* =======================================================
     THEME EFFECT
  ======================================================= */

  useEffect(() => {
    document.body.classList.toggle(
      'light',
      theme === 'light'
    );

    localStorage.setItem(
      'fitness-theme',
      theme
    );
  }, [theme]);

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = (message) => {
    const toast =
      document.getElementById('toast');

    if (!toast) {
      return;
    }

    toast.textContent = message;

    toast.classList.add('show');

    window.clearTimeout(
      showToast.timeoutId
    );

    showToast.timeoutId =
      window.setTimeout(() => {
        toast.classList.remove('show');
      }, 2800);
  };

  /* =======================================================
     OFFER
  ======================================================= */

  const handleClaimOffer = (
    offerName
  ) => {
    showToast(
      `${offerName} selected`
    );

    window.setTimeout(() => {
      document
        .getElementById('contact')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 100);
  };

  /* =======================================================
     THEME TOGGLE
  ======================================================= */

  const toggleTheme = () => {
    setTheme(
      (currentTheme) =>
        currentTheme === 'light'
          ? 'dark'
          : 'light'
    );
  };

  /* =======================================================
     ROUTES
  ======================================================= */

  return (
    <BrowserRouter>
      <RouteMeta />

      <Routes>
        {/* =================================================
            GYM SELECTION
        ================================================= */}

        <Route
          path="/"
          element={<GymSelection />}
        />

        {/* =================================================
            KALYANPUR BRANCH
        ================================================= */}

        <Route
          path="/kalyanpur"
          element={
            <HomePage
              branchConfig={
                BRANCH_CONFIG.kalyanpur
              }

              onClaimOffer={
                handleClaimOffer
              }

              theme={theme}

              onToggleTheme={
                toggleTheme
              }
            />
          }
        />

        {/* =================================================
            GOPALPUR BRANCH
        ================================================= */}

        <Route
          path="/gopalpur"
          element={
            <HomePage
              branchConfig={
                BRANCH_CONFIG.gopalpur
              }

              onClaimOffer={
                handleClaimOffer
              }

              theme={theme}

              onToggleTheme={
                toggleTheme
              }
            />
          }
        />

        {/* =================================================
            ADMIN LOGIN
        ================================================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            MEMBER DETAILS
        ================================================= */}

        <Route
          path="/admin/members/:id"
          element={
            <ProtectedRoute>
              <MemberDetails />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PAYMENT RECEIPT
        ================================================= */}

        <Route
          path="/admin/payments/:id/receipt"
          element={
            <ProtectedRoute>
              <PaymentReceipt />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            UNKNOWN ROUTES
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;