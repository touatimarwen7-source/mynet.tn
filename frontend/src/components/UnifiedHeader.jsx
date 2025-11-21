import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/unified-header.css';

export default function UnifiedHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('Utilisateur');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('userRole');
      const name = localStorage.getItem('userName') || 'Utilisateur';
      setIsAuthenticated(!!token);
      setUserRole(role);
      setUserName(name);
    };

    checkAuth();
    window.addEventListener('authChanged', checkAuth);
    return () => window.removeEventListener('authChanged', checkAuth);
  }, []);

  const isPublicPage = ['/', '/about', '/features', '/pricing', '/contact'].includes(
    location.pathname
  );

  // Always show authenticated links when logged in, regardless of page
  const publicLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'À Propos', href: '/about' },
    { label: 'Solutions', href: '/features' },
    { label: 'Tarification', href: '/pricing' },
    { label: 'Contact', href: '/contact' }
  ];

  const authenticatedLinks = [
    { label: 'Tableau de Bord', href: '/dashboard' },
    { label: 'Appels d\'Offres', href: '/tenders' },
    { label: 'Mon Profil', href: '/profile' }
  ];

  // Show authenticated links if logged in, even on protected pages
  const shouldShowAuthLinks = isAuthenticated;
  const shouldShowPublicLinks = isPublicPage || !isAuthenticated;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/login');
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="unified-header">
      <div className="header-container">
        {/* LEFT SECTION: Logo & Navigation */}
        <div className="header-left">
          <div className="header-brand">
            <a href="/" className="brand-logo">
              <span className="brand-icon">🌐</span>
              <span className="brand-text">MyNet.tn</span>
            </a>
          </div>

          <nav className="header-nav">
            {shouldShowAuthLinks ? (
              <>
                {authenticatedLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
                  >
                    {link.label}
                  </a>
                ))}
              </>
            ) : shouldShowPublicLinks ? (
              <>
                {publicLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
                  >
                    {link.label}
                  </a>
                ))}
              </>
            ) : null}
          </nav>
        </div>

        {/* CENTER SECTION: Global Search */}
        {isAuthenticated && (
          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Rechercher appels d'offres..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Rechercher">
              🔍
            </button>
          </form>
        )}

        {/* RIGHT SECTION: Actions & Profile */}
        <div className="header-right">
          {isAuthenticated ? (
            <>
              {/* Profile Menu */}
              <div className="profile-menu">
                <span className="profile-avatar">{userName.charAt(0).toUpperCase()}</span>
                <div className="profile-info">
                  <span className="profile-name">{userName}</span>
                  <span className="profile-role">
                    {userRole === 'buyer' ? 'Acheteur' : 'Fournisseur'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button className="btn-logout" onClick={handleLogout} title="Se Déconnecter">
                Se Déconnecter
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="btn-login">
                Connexion
              </a>
              <a href="/register" className="btn-register">
                Inscription
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {shouldShowAuthLinks ? (
              <>
                {authenticatedLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`mobile-nav-link ${
                      location.pathname === link.href ? 'active' : ''
                    }`}
                    onClick={handleNavClick}
                  >
                    {link.label}
                  </a>
                ))}
              </>
            ) : shouldShowPublicLinks ? (
              <>
                {publicLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`mobile-nav-link ${
                      location.pathname === link.href ? 'active' : ''
                    }`}
                    onClick={handleNavClick}
                  >
                    {link.label}
                  </a>
                ))}
              </>
            ) : null}
          </nav>

          <div className="mobile-actions">
            {isAuthenticated ? (
              <>
                <div className="mobile-profile">
                  <span className="profile-avatar">{userName.charAt(0).toUpperCase()}</span>
                  <div>
                    <div className="profile-name">{userName}</div>
                    <div className="profile-role">
                      {userRole === 'buyer' ? 'Acheteur' : 'Fournisseur'}
                    </div>
                  </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                  Se Déconnecter
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="btn-login">
                  Connexion
                </a>
                <a href="/register" className="btn-register">
                  Inscription
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
