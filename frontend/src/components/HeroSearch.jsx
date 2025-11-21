import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/hero-search.css';

export default function HeroSearch() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tenders');
  const [searchData, setSearchData] = useState({
    category: 'tous',
    keywords: '',
    region: 'all',
    type: 'tenders'
  });

  const searchTabs = [
    { id: 'markets', label: 'Nouveaux Marchés' },
    { id: 'tenders', label: 'Appels d\'Offres' },
    { id: 'awards', label: 'Attributions' },
    { id: 'data', label: 'Données Essentielles' }
  ];

  const categories = [
    { value: 'tous', label: 'Tous' },
    { value: 'travaux', label: 'Travaux' },
    { value: 'services', label: 'Services' },
    { value: 'fournitures', label: 'Fournitures' }
  ];

  const regions = [
    { value: 'all', label: 'Ensemble du Territoire' },
    { value: 'tunis', label: 'Tunis' },
    { value: 'ariana', label: 'Ariana' },
    { value: 'ben-arous', label: 'Ben Arous' },
    { value: 'manouba', label: 'Manouba' },
    { value: 'nabeul', label: 'Nabeul' },
    { value: 'hammamet', label: 'Hammamet' },
    { value: 'sfax', label: 'Sfax' },
    { value: 'sousse', label: 'Sousse' },
    { value: 'monastir', label: 'Monastir' },
    { value: 'kairouan', label: 'Kairouan' },
    { value: 'kasserine', label: 'Kasserine' },
    { value: 'sidi-bouzid', label: 'Sidi Bouzid' },
    { value: 'gabes', label: 'Gabès' },
    { value: 'medenine', label: 'Médenine' },
    { value: 'tataouine', label: 'Tataouine' },
    { value: 'djerba', label: 'Djerba' },
    { value: 'tozeur', label: 'Tozeur' },
    { value: 'kebili', label: 'Kébili' },
    { value: 'douz', label: 'Douz' },
    { value: 'jendouba', label: 'Jendouba' },
    { value: 'beja', label: 'Béja' },
    { value: 'kef', label: 'Le Kef' },
    { value: 'siliana', label: 'Siliana' },
    { value: 'zaghouan', label: 'Zaghouan' }
  ];

  const getButtonText = () => {
    switch(activeTab) {
      case 'markets':
        return 'Effectuer la Recherche - Nouveaux Marchés';
      case 'tenders':
        return 'Effectuer la Recherche - Appels d\'Offres';
      case 'awards':
        return 'Effectuer la Recherche - Attributions';
      case 'data':
        return 'Effectuer la Recherche - Données Essentielles';
      default:
        return 'Effectuer la Recherche';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchData.keywords) params.append('q', searchData.keywords);
    if (searchData.category !== 'tous') params.append('category', searchData.category);
    if (searchData.region !== 'all') params.append('region', searchData.region);
    params.append('type', activeTab);
    
    const routeMap = {
      tenders: '/tenders',
      awards: '/awards',
      markets: '/markets',
      data: '/data'
    };
    
    navigate(`${routeMap[activeTab]}?${params.toString()}`);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchData({ ...searchData, type: tabId });
  };

  const handleCategoryChange = (e) => {
    setSearchData({ ...searchData, category: e.target.value });
  };

  const handleKeywordsChange = (e) => {
    setSearchData({ ...searchData, keywords: e.target.value });
  };

  const handleRegionChange = (e) => {
    setSearchData({ ...searchData, region: e.target.value });
  };

  return (
    <div className="hero-search-container">
      {/* Search Type Tabs */}
      <div className="search-tabs">
        {searchTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="hero-search-form">
        {/* Category Filter */}
        <div className="search-filters">
          <div className="filter-group">
            <label className="filter-label">Catégorie</label>
            <div className="filter-options">
              {categories.map(cat => (
                <div key={cat.value} className="radio-option">
                  <input
                    type="radio"
                    id={`cat-${cat.value}`}
                    name="category"
                    value={cat.value}
                    checked={searchData.category === cat.value}
                    onChange={handleCategoryChange}
                  />
                  <label htmlFor={`cat-${cat.value}`}>{cat.label}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Fields */}
        <div className="search-fields">
          {/* Keywords Input */}
          <div className="search-field keywords-field">
            <label htmlFor="keywords-input" className="field-label">
              Mots-clés ou Organisme Public
            </label>
            <div className="input-wrapper">
              <input
                id="keywords-input"
                type="text"
                placeholder="Exemple: Construction, Informatique, Services"
                value={searchData.keywords}
                onChange={handleKeywordsChange}
                className="search-input"
              />
              <span className="input-icon">🔍</span>
            </div>
          </div>

          {/* Region Select */}
          <div className="search-field region-field">
            <label htmlFor="region-select" className="field-label">
              Zone Géographique
            </label>
            <div className="select-wrapper">
              <select
                id="region-select"
                value={searchData.region}
                onChange={handleRegionChange}
                className="search-select"
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              <span className="select-icon">📍</span>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button type="submit" className="search-button">
          <span className="button-icon">🔎</span>
          <span>{getButtonText()}</span>
        </button>
      </form>
    </div>
  );
}
