import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/advanced-search.css';

export default function AdvancedSearch() {
  const [category, setCategory] = useState('tous');
  const [keywords, setKeywords] = useState('');
  const [region, setRegion] = useState('all');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (keywords) params.append('q', keywords);
    if (region) params.append('region', region);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form className="advanced-search" onSubmit={handleSearch}>
      {/* Category Radio Buttons */}
      <div className="search-section">
        <h3 className="search-title">Catégorie</h3>
        <div className="category-options">
          <div className="radio-option">
            <input
              type="radio"
              name="category"
              value="tous"
              id="cat-all"
              checked={category === 'tous'}
              onChange={(e) => setCategory(e.target.value)}
            />
            <label htmlFor="cat-all">Tous</label>
          </div>
          <div className="radio-option">
            <input
              type="radio"
              name="category"
              value="travaux"
              id="cat-works"
              checked={category === 'travaux'}
              onChange={(e) => setCategory(e.target.value)}
            />
            <label htmlFor="cat-works">Travaux</label>
          </div>
          <div className="radio-option">
            <input
              type="radio"
              name="category"
              value="services"
              id="cat-services"
              checked={category === 'services'}
              onChange={(e) => setCategory(e.target.value)}
            />
            <label htmlFor="cat-services">Services</label>
          </div>
          <div className="radio-option">
            <input
              type="radio"
              name="category"
              value="fournitures"
              id="cat-supplies"
              checked={category === 'fournitures'}
              onChange={(e) => setCategory(e.target.value)}
            />
            <label htmlFor="cat-supplies">Fournitures</label>
          </div>
        </div>
      </div>

      {/* Search Fields Grid */}
      <div className="search-grid">
        {/* Keywords Field */}
        <div className="search-field">
          <label htmlFor="keywords" className="search-label">Mots clés ou nom d'organisme</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="keywords"
              name="keywords"
              className="search-input"
              placeholder="Ex : Plomberie, parking, etc..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Region Field */}
        <div className="search-field">
          <label htmlFor="region" className="search-label">Zone géographique</label>
          <select
            id="region"
            name="region"
            className="search-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="all">Toutes les régions</option>
            <option value="tunis">Tunis</option>
            <option value="ariana">Ariana</option>
            <option value="ben-arous">Ben Arous</option>
            <option value="manouba">Manouba</option>
            <option value="sousse">Sousse</option>
            <option value="sfax">Sfax</option>
            <option value="kairouan">Kairouan</option>
            <option value="kasserine">Kasserine</option>
            <option value="gafsa">Gafsa</option>
            <option value="tozeur">Tozeur</option>
            <option value="djerba">Djerba</option>
            <option value="gabes">Gabès</option>
            <option value="tataouine">Tataouine</option>
            <option value="medenine">Médenine</option>
            <option value="mahdia">Mahdia</option>
            <option value="monastir">Monastir</option>
            <option value="hammamet">Hammamet</option>
            <option value="nabeul">Nabeul</option>
            <option value="zaghouan">Zaghouan</option>
            <option value="bizerte">Bizerte</option>
            <option value="jendouba">Jendouba</option>
            <option value="kef">Kef</option>
            <option value="siliana">Siliana</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="search-actions">
        <button type="submit" className="search-submit-btn">
          Rechercher
        </button>
      </div>
    </form>
  );
}
