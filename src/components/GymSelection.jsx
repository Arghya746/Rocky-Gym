import { Link } from 'react-router-dom';
import './GymSelection.css';

const gyms = [
  {
    id: 'kalyanpur',
    name: 'KALYANPUR',
    description: 'Explore the Kalyanpur branch',
    route: '/kalyanpur',
    className: 'gym-card-kalyanpur',
  },
  {
    id: 'gopalpur',
    name: 'GOPALPUR',
    description: 'Explore the Gopalpur branch',
    route: '/gopalpur',
    className: 'gym-card-gopalpur',
  },
];

export default function GymSelection() {
  return (
    <section className="gym-selection">
      <div className="gym-selection-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="gym-selection-header">

          <span className="section-tag">
            ALPHA GYM
          </span>

          <h1>
            CHOOSE
            <span> YOUR GYM.</span>
          </h1>

          <p>
            Select your preferred Alpha Gym branch to view its
            trainers, memberships, offers, gallery and contact details.
          </p>

        </div>


        {/* =================================================
            GYM CARDS
            ================================================= */}

        <div className="gym-selection-grid">

          {gyms.map((gym) => (
            <Link
              key={gym.id}
              to={gym.route}
              className={`gym-selection-card ${gym.className}`}
            >

              <div className="gym-card-content">

                {/* CARD NUMBER */}

                <span className="gym-card-number">
                  {gym.id === 'kalyanpur' ? '01' : '02'}
                </span>


                {/* GYM NAME */}

                <h2>
                  {gym.name}
                </h2>


                {/* DESCRIPTION */}

                <p>
                  {gym.description}
                </p>


                {/* VIEW GYM */}

                <span className="gym-card-link">
                  VIEW GYM <span>→</span>
                </span>

              </div>

            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}