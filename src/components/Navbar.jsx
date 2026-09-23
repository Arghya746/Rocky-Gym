const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Membership', href: '#plans' },
  { label: 'Software', href: '#portal' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({
  theme,
  onToggleTheme,
  branchConfig,
}) {
  const branchName =
    branchConfig?.gym?.branchName ||
    branchConfig?.name ||
    'Alpha Gym';

  const displayName =
    branchConfig?.gym?.displayName ||
    `Alpha Gym ${branchName}`;

  return (
    <header className="header">
      <div className="container nav">

        {/* LOGO */}
        <a
          href="#home"
          className="logo"
          aria-label={`${displayName} home`}
        >
          ALPHA<span>•</span>GYM
        </a>

        {/* NAVIGATION */}
        <nav
          className="nav-links"
          aria-label={`${displayName} main navigation`}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="nav-actions">

          {/* BRANCH NAME */}
          <span
            className="nav-branch"
            title={`Current branch: ${branchName}`}
          >
            {branchName.toUpperCase()}
          </span>

          {/* THEME */}
          <button
            id="themeToggle"
            className="theme-toggle"
            aria-label="Toggle theme"
            type="button"
            onClick={onToggleTheme}
          >
            {theme === 'light' ? '🌙' : '☀'}
          </button>

          {/* FREE TRIAL */}
          <a
            href="#contact"
            className="nav-btn"
          >
            FREE TRIAL
          </a>

        </div>
      </div>
    </header>
  );
}