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
   SHARED BRANCH CONFIGURATION

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

    title: 'Alpha Gym Kalyanpur',

    description:
      'Alpha Gym Kalyanpur — gym information, trainers, memberships, offers, gallery and contact details.',

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

       Membership Plans are intentionally removed.
       Offers remain separate.
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

    title: 'Alpha Gym Gopalpur',

    description:
      'Alpha Gym Gopalpur — gym information, trainers, memberships, offers, gallery and contact details.',

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

    /* -----------------------------------------------------
       ROBOTS
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       TITLE
    ----------------------------------------------------- */

    if (branchConfig) {
      document.title = branchConfig.title;
    } else if (pathname === '/') {
      document.title = 'Choose Your Gym • Alpha Gym';
    } else if (pathname === '/admin/login') {
      document.title = 'Admin Login • Alpha Gym';
    } else if (isAdminRoute) {
      document.title = 'Admin Dashboard • Alpha Gym';
    } else {
      document.title = 'Alpha Gym';
    }

    /* -----------------------------------------------------
       DESCRIPTION
    ----------------------------------------------------- */

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

    if (branchConfig) {
      descriptionMeta.setAttribute(
        'content',
        branchConfig.description
      );
    } else if (pathname === '/') {
      descriptionMeta.setAttribute(
        'content',
        'Choose your Alpha Gym branch — Kalyanpur or Gopalpur.'
      );
    } else {
      descriptionMeta.setAttribute(
        'content',
        'Alpha Gym premium fitness experience.'
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
    const toast = document.getElementById('toast');

    if (!toast) {
      return;
    }

    toast.textContent = message;

    toast.classList.add('show');

    window.clearTimeout(
      showToast.timeoutId
    );

    showToast.timeoutId = window.setTimeout(() => {
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

            AdminDashboard.jsx remains unchanged.
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