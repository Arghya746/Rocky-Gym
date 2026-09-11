
import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';

import './App.css';

import AboutUsSection from './components/AboutUsSection';
import ContactSection from './components/ContactSection';
import FAQSection from './components/FAQSection';
import GallerySection from './components/GallerySection';
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

import ProtectedRoute from './components/ProtectedRoute';

// ADMIN PAGES
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import MemberDetails from './pages/MemberDetails';
import PaymentReceipt from './pages/PaymentReceipt';


function HomePage({
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
      />

      <main>

        {/* HERO */}
        <Hero />

        {/* MARQUEE */}
        <Marquee />

        {/* HOME INTRO */}
        <HomeIntro />

        {/* ABOUT */}
        <AboutUsSection />

        {/* SERVICES */}
        <ServicesSection />

        {/* GYM TIMINGS */}
        <TimingsSection />

        {/* GALLERY */}
        <GallerySection />

        {/* TRAINERS */}
        <TrainersSection />

        {/* OFFERS */}
        <OffersSection
          onClaimOffer={onClaimOffer}
        />

        {/* PRICING */}
        <PricingSection
          onSelectPlan={onSelectPlan}
        />

        {/* SOFTWARE / MEMBER MANAGEMENT */}
        <SoftwareSection />

        {/* MOTIVATION */}
        <MotivationSection />

        {/* TESTIMONIALS */}
        <TestimonialSection />

        {/* FAQ */}
        <FAQSection />

        {/* CONTACT */}
        <ContactSection />

      </main>


      {/* FOOTER */}
      <footer>

        <div className="container footer-content">

          <p>
            © 2026 Alpha Gym • Premium fitness experience
          </p>

          <span>
            TRAIN HARD • LIVE STRONG
          </span>

        </div>


        <div className="container disclaimer">

          * Schedule and offers may vary. Please contact Alpha Gym
          for the latest membership information.

        </div>

      </footer>


      {/* TOAST MESSAGE */}
      <div
        id="toast"
        className="toast"
        aria-live="polite"
        aria-atomic="true"
      />

    </>
  );
}


function App() {

  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem('fitness-theme') || 'dark'
  );


  /* ================================
     THEME MANAGEMENT
  ================================ */

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


  /* ================================
     TOAST MESSAGE
  ================================ */

  const showToast = (message) => {

    const toast =
      document.getElementById('toast');

    if (!toast) return;

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


  /* ================================
     PRICING PLAN
  ================================ */

  const handleSelectPlan = (
    plan,
    price
  ) => {

    showToast(
      `${plan} selected • ₹${Number(price).toLocaleString('en-IN')}`
    );

    document
      .getElementById('contact')
      ?.scrollIntoView({
        behavior: 'smooth',
      });

  };


  /* ================================
     OFFER
  ================================ */

  const handleClaimOffer = (
    offerName
  ) => {

    showToast(
      `${offerName} selected`
    );

    document
      .getElementById('contact')
      ?.scrollIntoView({
        behavior: 'smooth',
      });

  };


  /* ================================
     APP ROUTES
  ================================ */

  return (

    <BrowserRouter>

      <Routes>


        {/* =========================
            PUBLIC HOME PAGE
        ========================= */}

        <Route
          path="/"
          element={
            <HomePage
              onSelectPlan={
                handleSelectPlan
              }

              onClaimOffer={
                handleClaimOffer
              }

              theme={theme}

              onToggleTheme={() =>
                setTheme((current) =>
                  current === 'light'
                    ? 'dark'
                    : 'light'
                )
              }
            />
          }
        />


        {/* =========================
            ADMIN LOGIN
        ========================= */}

        <Route
          path="/admin/login"
          element={
            <AdminLogin />
          }
        />


        {/* =========================
            PROTECTED ADMIN DASHBOARD
        ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================
            PROTECTED MEMBER DETAILS
        ========================= */}

        <Route
          path="/admin/members/:id"
          element={
            <ProtectedRoute>
              <MemberDetails />
            </ProtectedRoute>
          }
        />


        {/* =========================
            PROTECTED PAYMENT RECEIPT
        ========================= */}

        <Route
          path="/admin/payments/:id/receipt"
          element={
            <ProtectedRoute>
              <PaymentReceipt />
            </ProtectedRoute>
          }
        />


      </Routes>

    </BrowserRouter>

  );
}


export default App;