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
import PricingSection from './components/PricingSection';
import ServicesSection from './components/ServicesSection';
import SoftwareSection from './components/SoftwareSection';
import TestimonialSection from './components/TestimonialSection';
import TimingsSection from './components/TimingsSection';
import TrainersSection from './components/TrainersSection';

/* =========================================================
   ADMIN / AUTH COMPONENTS
   ========================================================= */

import ProtectedRoute from './components/ProtectedRoute';

import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import MemberDetails from './pages/MemberDetails';
import PaymentReceipt from './pages/PaymentReceipt';


/* =========================================================
   BRANCH CONFIGURATION
   =========================================================
   
   Keep all branch-specific information here.

   Components receive the selected branch through:

   branchConfig={BRANCH_CONFIG.kalyanpur}

   or

   branchConfig={BRANCH_CONFIG.gopalpur}

   This keeps the public website scalable without touching
   AdminDashboard.jsx.
   ========================================================= */

export const BRANCH_CONFIG = {
  kalyanpur: {
    id: 'kalyanpur',
    name: 'Kalyanpur',
    slug: 'kalyanpur',

    title: 'Alpha Gym Kalyanpur',

    description:
      'Alpha Gym Kalyanpur — premium fitness training, memberships, trainers, offers and gym facilities.',

    gym: {
      name: 'Alpha Gym',
      branchName: 'Kalyanpur',
      displayName: 'Alpha Gym Kalyanpur',

      photo: '',

      tagline: 'TRAIN HARD • LIVE STRONG',

      description:
        'Premium fitness training and gym facilities at our Kalyanpur branch.',
    },

    owner: {
      name: '',
      photo: '',
      phone: '',
      email: '',
    },

    admin: {
      name: '',
      photo: '',
      email: '',
      phone: '',
    },

    trainers: [
      {
        id: 'kalyanpur-trainer-1',
        name: '',
        role: 'Personal Trainer',
        photo: '',
        experience: '',
        specialization: '',
      },

      {
        id: 'kalyanpur-trainer-2',
        name: '',
        role: 'Fitness Trainer',
        photo: '',
        experience: '',
        specialization: '',
      },

      {
        id: 'kalyanpur-trainer-3',
        name: '',
        role: 'Strength Trainer',
        photo: '',
        experience: '',
        specialization: '',
      },
    ],

    membershipPlans: [
      {
        id: 'kalyanpur-monthly',
        name: 'Monthly',
        price: '',
        duration: '1 Month',
        description: '',
      },

      {
        id: 'kalyanpur-quarterly',
        name: 'Quarterly',
        price: '',
        duration: '3 Months',
        description: '',
      },

      {
        id: 'kalyanpur-half-yearly',
        name: 'Half Yearly',
        price: '',
        duration: '6 Months',
        description: '',
      },

      {
        id: 'kalyanpur-yearly',
        name: 'Yearly',
        price: '',
        duration: '12 Months',
        description: '',
      },
    ],

    offers: [
      {
        id: 'kalyanpur-offer-1',
        name: '',
        title: '',
        description: '',
        price: '',
        validUntil: '',
      },

      {
        id: 'kalyanpur-offer-2',
        name: '',
        title: '',
        description: '',
        price: '',
        validUntil: '',
      },
    ],

    contact: {
      phone: '',
      email: '',
      whatsapp: '',
      address: '',
      city: 'Kalyanpur',
      state: 'West Bengal',
      country: 'India',
    },

    location: {
      address: '',
      city: 'Kalyanpur',
      state: 'West Bengal',
      country: 'India',
      mapUrl: '',
      latitude: '',
      longitude: '',
    },

    timings: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },

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
      'Alpha Gym Gopalpur — premium fitness training, memberships, trainers, offers and gym facilities.',

    gym: {
      name: 'Alpha Gym',
      branchName: 'Gopalpur',
      displayName: 'Alpha Gym Gopalpur',

      photo: '',

      tagline: 'TRAIN HARD • LIVE STRONG',

      description:
        'Premium fitness training and gym facilities at our Gopalpur branch.',
    },

    owner: {
      name: '',
      photo: '',
      phone: '',
      email: '',
    },

    admin: {
      name: '',
      photo: '',
      email: '',
      phone: '',
    },

    trainers: [
      {
        id: 'gopalpur-trainer-1',
        name: '',
        role: 'Personal Trainer',
        photo: '',
        experience: '',
        specialization: '',
      },

      {
        id: 'gopalpur-trainer-2',
        name: '',
        role: 'Fitness Trainer',
        photo: '',
        experience: '',
        specialization: '',
      },

      {
        id: 'gopalpur-trainer-3',
        name: '',
        role: 'Strength Trainer',
        photo: '',
        experience: '',
        specialization: '',
      },
    ],

    membershipPlans: [
      {
        id: 'gopalpur-monthly',
        name: 'Monthly',
        price: '',
        duration: '1 Month',
        description: '',
      },

      {
        id: 'gopalpur-quarterly',
        name: 'Quarterly',
        price: '',
        duration: '3 Months',
        description: '',
      },

      {
        id: 'gopalpur-half-yearly',
        name: 'Half Yearly',
        price: '',
        duration: '6 Months',
        description: '',
      },

      {
        id: 'gopalpur-yearly',
        name: 'Yearly',
        price: '',
        duration: '12 Months',
        description: '',
      },
    ],

    offers: [
      {
        id: 'gopalpur-offer-1',
        name: '',
        title: '',
        description: '',
        price: '',
        validUntil: '',
      },

      {
        id: 'gopalpur-offer-2',
        name: '',
        title: '',
        description: '',
        price: '',
        validUntil: '',
      },
    ],

    contact: {
      phone: '',
      email: '',
      whatsapp: '',
      address: '',
      city: 'Gopalpur',
      state: 'West Bengal',
      country: 'India',
    },

    location: {
      address: '',
      city: 'Gopalpur',
      state: 'West Bengal',
      country: 'India',
      mapUrl: '',
      latitude: '',
      longitude: '',
    },

    timings: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },

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
  onSelectPlan,
  onClaimOffer,
  theme,
  onToggleTheme,
}) {
  return (
    <>
      <Navbar
        theme={theme}
        onToggleTheme={onToggleTheme}
        branchConfig={branchConfig}
      />

      <main>
        <Hero branchConfig={branchConfig} />

        <Marquee branchConfig={branchConfig} />

        <HomeIntro branchConfig={branchConfig} />

        <AboutUsSection
          branchConfig={branchConfig}
        />

        <ServicesSection
          branchConfig={branchConfig}
        />

        <TimingsSection
          branchConfig={branchConfig}
        />

        <GallerySection
          branchConfig={branchConfig}
        />

        <TrainersSection
          branchConfig={branchConfig}
        />

        <OffersSection
          branchConfig={branchConfig}
          onClaimOffer={onClaimOffer}
        />

        <PricingSection
          branchConfig={branchConfig}
          onSelectPlan={onSelectPlan}
        />

        <SoftwareSection
          branchConfig={branchConfig}
        />

        <MotivationSection
          branchConfig={branchConfig}
        />

        <TestimonialSection
          branchConfig={branchConfig}
        />

        <FAQSection
          branchConfig={branchConfig}
        />

        <ContactSection
          branchConfig={branchConfig}
        />
      </main>

      <footer>
        <div className="container footer-content">
          <p>
            © 2026 {branchConfig.gym.displayName}
            {' • Premium fitness experience'}
          </p>

          <span>
            {branchConfig.gym.tagline}
          </span>
        </div>

        <div className="container disclaimer">
          * Schedule and offers may vary. Please contact{' '}
          {branchConfig.gym.displayName} for the latest
          membership information.
        </div>
      </footer>

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
   ROUTE META / SEO
   ========================================================= */

function RouteMeta() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    const isAdminRoute =
      pathname.startsWith('/admin');

    const branchConfig =
      pathname === '/kalyanpur'
        ? BRANCH_CONFIG.kalyanpur
        : pathname === '/gopalpur'
          ? BRANCH_CONFIG.gopalpur
          : null;


    /* -------------------------------------------------------
       ROBOTS META
    ------------------------------------------------------- */

    let robotsMeta =
      document.querySelector(
        'meta[name="robots"]'
      );

    if (!robotsMeta) {
      robotsMeta =
        document.createElement('meta');

      robotsMeta.setAttribute(
        'name',
        'robots'
      );

      document.head.appendChild(
        robotsMeta
      );
    }

    robotsMeta.setAttribute(
      'content',
      isAdminRoute
        ? 'noindex, nofollow, noarchive'
        : 'index, follow'
    );


    /* -------------------------------------------------------
       PAGE TITLE
    ------------------------------------------------------- */

    if (branchConfig) {
      document.title =
        branchConfig.title;
    } else if (pathname === '/') {
      document.title =
        'Choose Your Gym • Alpha Gym';
    } else if (
      pathname === '/admin/login'
    ) {
      document.title =
        'Admin Login • Alpha Gym';
    } else if (isAdminRoute) {
      document.title =
        'Admin Dashboard • Alpha Gym';
    } else {
      document.title =
        'Alpha Gym';
    }


    /* -------------------------------------------------------
       META DESCRIPTION
    ------------------------------------------------------- */

    let descriptionMeta =
      document.querySelector(
        'meta[name="description"]'
      );

    if (!descriptionMeta) {
      descriptionMeta =
        document.createElement('meta');

      descriptionMeta.setAttribute(
        'name',
        'description'
      );

      document.head.appendChild(
        descriptionMeta
      );
    }

    descriptionMeta.setAttribute(
      'content',
      branchConfig
        ? branchConfig.description
        : pathname === '/'
          ? 'Choose your Alpha Gym branch — Kalyanpur or Gopalpur.'
          : isAdminRoute
            ? 'Alpha Gym administration portal.'
            : 'Alpha Gym premium fitness experience.'
    );
  }, [location.pathname]);

  return null;
}


/* =========================================================
   MAIN APP
   ========================================================= */

function App() {

  /* =======================================================
     THEME
  ======================================================= */

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem(
        'fitness-theme'
      ) || 'dark'
    );
  });


  /* =======================================================
     APPLY THEME
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
      document.getElementById(
        'toast'
      );

    if (!toast) {
      return;
    }

    toast.textContent =
      message;

    toast.classList.add(
      'show'
    );

    window.clearTimeout(
      showToast.timeoutId
    );

    showToast.timeoutId =
      window.setTimeout(() => {
        toast.classList.remove(
          'show'
        );
      }, 2800);
  };


  /* =======================================================
     PLAN SELECTION
  ======================================================= */

  const handleSelectPlan = (
    plan,
    price
  ) => {
    const numericPrice =
      Number(price);

    const formattedPrice =
      Number.isFinite(numericPrice)
        ? numericPrice.toLocaleString(
            'en-IN'
          )
        : price;

    showToast(
      `${plan} selected • ₹${formattedPrice}`
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
     OFFER SELECTION
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
          element={
            <GymSelection />
          }
        />


        {/* =================================================
            KALYANPUR
        ================================================= */}

        <Route
          path="/kalyanpur"
          element={
            <HomePage
              branchConfig={
                BRANCH_CONFIG.kalyanpur
              }
              onSelectPlan={
                handleSelectPlan
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
            GOPALPUR
        ================================================= */}

        <Route
          path="/gopalpur"
          element={
            <HomePage
              branchConfig={
                BRANCH_CONFIG.gopalpur
              }
              onSelectPlan={
                handleSelectPlan
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
          element={
            <AdminLogin />
          }
        />


        {/* =================================================
            ADMIN DASHBOARD

            DO NOT MODIFY AdminDashboard.jsx
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