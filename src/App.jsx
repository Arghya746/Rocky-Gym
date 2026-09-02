import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import ContactSection from './components/ContactSection';
import Hero from './components/Hero';
import HomeIntro from './components/HomeIntro';
import Marquee from './components/Marquee';
import MotivationSection from './components/MotivationSection';
import Navbar from './components/Navbar';
import OffersSection from './components/OffersSection';
import PricingSection from './components/PricingSection';
import SoftwareSection from './components/SoftwareSection';
import TestimonialSection from './components/TestimonialSection';

function HomePage({ onSelectPlan, onClaimOffer, theme, onToggleTheme }) {
  return (
    <>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        <Hero />
        <Marquee />
        <HomeIntro />
        <OffersSection onClaimOffer={onClaimOffer} />
        <PricingSection onSelectPlan={onSelectPlan} />
        <SoftwareSection />
        <MotivationSection />
        <TestimonialSection />
        <ContactSection />
      </main>

      <footer>
        <div className="container footer-content">
          <p>© 2025 Alpha Gym • Premium fitness experience</p>
          <span>TRAIN HARD • LIVE STRONG</span>
        </div>
        <div className="container disclaimer">
          * Schedule and offers may vary. Please contact Alpha Gym for the latest membership
          information.
        </div>
      </footer>

      <div id="toast" className="toast" aria-live="polite" aria-atomic="true" />
    </>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('fitness-theme') || 'dark');

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('fitness-theme', theme);
  }, [theme]);

  const showToast = (message) => {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  const handleSelectPlan = (plan, price) => {
    showToast(`${plan} selected • ₹${Number(price).toLocaleString('en-IN')}`);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClaimOffer = (offerName) => {
    showToast(`${offerName} selected`);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onSelectPlan={handleSelectPlan}
              onClaimOffer={handleClaimOffer}
              theme={theme}
              onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
