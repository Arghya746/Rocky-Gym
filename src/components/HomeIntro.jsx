import cardioImage from '../assets/Cardio.jpg.jpeg';
import trainerImage from '../assets/Trainers.jpg.jpeg';
import strengthImage from '../assets/Strengths.jpg.jpeg';

const features = [
  {
    number: '01',
    image: cardioImage,
    title: 'CARDIO SESSIONS',
    description:
      'Boost your stamina, endurance and energy with dynamic cardio sessions designed to keep you active and consistent.',
    link: '#contact',
    linkText: 'Explore →',
    className: 'feature-orange',
  },
  {
    number: '02',
    image: trainerImage,
    title: 'PERSONAL TRAINER SESSIONS',
    description:
      'Train with expert guidance, personalized workout plans and proper techniques designed around your fitness goals.',
    link: '#contact',
    linkText: 'Meet Trainers →',
    className: 'feature-purple',
  },
  {
    number: '03',
    image: strengthImage,
    title: 'STRENGTH TRAINING SESSIONS',
    description:
      'Build strength, power and confidence with structured resistance training focused on steady and measurable progress.',
    link: '#offers',
    linkText: 'View Offers →',
    className: 'feature-cyan',
  },
];

export default function HomeIntro({ branchConfig }) {
  const branchName =
    branchConfig?.gym?.branchName ||
    branchConfig?.name ||
    'Alpha Gym';

  const displayName =
    branchConfig?.gym?.displayName ||
    `Alpha Gym ${branchName}`;

  const description =
    branchConfig?.gym?.description ||
    'A place built for people who are ready to challenge themselves, build strength, and transform their lives.';

  return (
    <section
      id="features"
      className="section"
      data-branch={branchConfig?.id || ''}
    >
      <div className="container">

        {/* ALPHA GYM INTRODUCTION */}
        <div className="section-heading intro-heading">

          <div className="section-tag">
            WELCOME TO {displayName.toUpperCase()}
          </div>

          <h2>
            BUILT TO MAKE
            <span> YOU STRONGER.</span>
          </h2>

          <p>
            Welcome to {displayName} — a place built for people who are ready
            to challenge themselves, build strength, and transform their lives.
          </p>

          <p>
            {description}
          </p>

          <p>
            We believe fitness is not just about how you look in the mirror.
            It’s about becoming stronger, more confident, disciplined, and
            capable every single day. Whether you’re taking your first step
            into fitness or pushing toward your next personal best, our gym
            provides the equipment, environment, expertise, and motivation you
            need to reach your goals.
          </p>

        </div>


        {/* WHY ALPHA GYM */}
        <div className="section-heading why-heading">

          <div className="section-tag">
            WHY {branchName.toUpperCase()}
          </div>

          <h2>
            MORE THAN
            <span> A GYM.</span>
          </h2>

          <p>
            Everything you need to transform your body, improve your
            performance and stay consistent.
          </p>

        </div>


        {/* FEATURE CARDS
            SHOW ONLY ON GOPALPUR
            KALYANPUR: THREE FEATURE IMAGES REMOVED
        */}
        {branchName !== 'Kalyanpur' && (
          <div className="feature-grid">

            {features.map((feature) => (
              <article
                key={feature.number}
                className={`feature-card ${feature.className}`}
              >

                <div className="feature-number">
                  {feature.number}
                </div>

                <img
                  src={feature.image}
                  alt={`${feature.title} at ${displayName}`}
                  className="feature-image"
                />

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

                <a href={feature.link}>
                  {feature.linkText}
                </a>

              </article>
            ))}

          </div>
        )}

      </div>
    </section>
  );
}