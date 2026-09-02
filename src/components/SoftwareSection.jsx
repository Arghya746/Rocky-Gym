import { useEffect, useState } from 'react';

const dashboardTabs = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'members', label: 'Members', icon: '◉' },
  { id: 'workouts', label: 'Workouts', icon: '◇' },
  { id: 'payments', label: 'Payments', icon: '₹' },
];

const initialCounts = [214, 96, 14];

export default function SoftwareSection() {
  const [activeTab, setActiveTab] = useState('overview');
  const [counts, setCounts] = useState([0, 0, 0]);

  useEffect(() => {
    const startAnimation = () => {
      const animationStep = (index) => {
        const target = initialCounts[index];
        let current = 0;
        const increment = Math.max(1, Math.ceil(target / 40));

        const update = () => {
          current += increment;
          if (current >= target) {
            setCounts((prev) => {
              const next = [...prev];
              next[index] = target;
              return next;
            });
            return;
          }

          setCounts((prev) => {
            const next = [...prev];
            next[index] = current;
            return next;
          });

          requestAnimationFrame(() => update());
        };

        update();
      };

      initialCounts.forEach((_, index) => animationStep(index));
    };

    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(dashboard);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="portal" className="section software-section">
      <div className="container">
        <div className="software-intro">
          <div>
            <div className="section-tag">MERN GYM MANAGEMENT SYSTEM</div>
            <h2>
              YOUR GYM.
              <br />
              <span>ONE DASHBOARD.</span>
            </h2>
          </div>

          <p>
            A modern management platform for gym owners to manage members, attendance, payments
            and workout plans from one place.
          </p>
        </div>

        <div className="dashboard">
          <aside className="dashboard-sidebar">
            <div className="dashboard-logo">
              FP<span>•</span>ADMIN
            </div>

            {dashboardTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-top">
              <div>
                <small>WELCOME BACK</small>
                <h3>GYM ADMIN</h3>
              </div>

              <div className="online-status">
                <span /> SYSTEM ONLINE
              </div>
            </div>

            <div id="overview" className={`dashboard-panel ${activeTab === 'overview' ? 'active' : ''}`}>
              <div className="dashboard-stats">
                <div className="dash-stat">
                  <span>ACTIVE MEMBERS</span>
                  <strong data-count="214">{counts[0]}</strong>
                  <small>+12 this month</small>
                </div>

                <div className="dash-stat">
                  <span>TODAY'S CHECK-IN</span>
                  <strong data-count="96">{counts[1]}</strong>
                  <small>Live attendance</small>
                </div>

                <div className="dash-stat warning">
                  <span>EXPIRING SOON</span>
                  <strong data-count="14">{counts[2]}</strong>
                  <small>Requires attention</small>
                </div>
              </div>

              <div className="dashboard-table">
                <div className="table-title">RECENT ATTENDANCE</div>

                <div className="table-row table-head">
                  <span>MEMBER</span>
                  <span>PLAN</span>
                  <span>TIME</span>
                  <span>STATUS</span>
                </div>

                <div className="table-row">
                  <span>Rahul Banerjee</span>
                  <span>Annual</span>
                  <span>06:15 AM</span>
                  <b className="verified">VERIFIED</b>
                </div>

                <div className="table-row">
                  <span>S. Khatun</span>
                  <span>Quarterly</span>
                  <span>07:30 AM</span>
                  <b className="verified">VERIFIED</b>
                </div>

                <div className="table-row">
                  <span>Amit Roy</span>
                  <span>Half-Yearly</span>
                  <span>08:05 AM</span>
                  <b className="verified">VERIFIED</b>
                </div>
              </div>
            </div>

            <div id="members" className={`dashboard-panel ${activeTab === 'members' ? 'active' : ''}`}>
              <h3>MEMBER MANAGEMENT</h3>

              <div className="member-cards">
                <div>
                  <strong>#1001</strong>
                  <span>Rajesh Kumar</span>
                  <small>Annual Pro</small>
                </div>

                <div>
                  <strong>#1002</strong>
                  <span>Priya Sharma</span>
                  <small>Quarterly</small>
                </div>

                <div>
                  <strong>#1003</strong>
                  <span>Sneha Mukherjee</span>
                  <small>Half-Yearly</small>
                </div>
              </div>
            </div>

            <div id="workouts" className={`dashboard-panel ${activeTab === 'workouts' ? 'active' : ''}`}>
              <h3>WORKOUT PROGRAM</h3>

              <div className="workout-list">
                <div>
                  <span>Barbell Squats</span>
                  <b>4 × 8-10</b>
                  <small>80 KG</small>
                </div>

                <div>
                  <span>Incline Bench Press</span>
                  <b>3 × 10-12</b>
                  <small>60 KG</small>
                </div>

                <div>
                  <span>Lat Pulldown</span>
                  <b>4 × 12</b>
                  <small>55 KG</small>
                </div>
              </div>
            </div>

            <div id="payments" className={`dashboard-panel ${activeTab === 'payments' ? 'active' : ''}`}>
              <h3>PAYMENT LEDGER</h3>

              <div className="payment-list">
                <div>
                  <span>#INV-081</span>
                  <b>₹3,150</b>
                  <small>UPI / GPay</small>
                </div>

                <div>
                  <span>#INV-082</span>
                  <b>₹1,200</b>
                  <small>Cash</small>
                </div>

                <div>
                  <span>#INV-083</span>
                  <b>₹5,700</b>
                  <small>UPI</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="demo-note">DEMO SYSTEM • SAMPLE MEMBER DATA • NOT LIVE PRODUCTION DATA</div>
      </div>
    </section>
  );
}
