const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Membership', href: '#plans' },
  { label: 'Software', href: '#portal' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="container nav">
        <a href="#home" className="logo" aria-label="Alpha Gym home">
          ALPHA<span>•</span>GYM
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            id="themeToggle"
            className="theme-toggle"
            aria-label="Toggle theme"
            type="button"
            onClick={onToggleTheme}
          >
            {theme === 'light' ? '🌙' : '☀'}
          </button>

          <a href="#contact" className="nav-btn">
            FREE TRIAL
          </a>
        </div>
      </div>
    </header>
  );
}
