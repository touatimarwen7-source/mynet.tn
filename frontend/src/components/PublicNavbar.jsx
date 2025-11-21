import { useState } from 'react';
import '../styles/publicnavbar.css';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'À Propos', href: '/about' },
    { label: 'Solutions', href: '/features' },
    { label: 'Tarification', href: '/pricing' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <nav className="public-navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <a href="/">
            <span className="brand-icon">🌐</span>
            <span className="brand-text">MyNet.tn</span>
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="nav-link"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="navbar-auth">
          <a href="/login" className="btn-login">
            🔐 Connexion
          </a>
          <a href="/register" className="btn-register">
            ✍️ Inscription
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="mobile-auth">
            <a href="/login" className="btn-login">🔐 Connexion</a>
            <a href="/register" className="btn-register">✍️ Inscription</a>
          </div>
        </div>
      )}
    </nav>
  );
}
