import { useState, useEffect } from 'react';
import axios from 'axios';
import { setPageTitle } from '../utils/pageTitle';

export default function TeamManagement() {
  const [team, setTeam] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'procurement-officer',
    name: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Gestion de l\'Équipe');
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await axios.get('/api/company/team', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setTeam(response.data.team || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/company/team', newMember, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('Membre ajouté avec succès');
      setNewMember({ email: '', role: 'procurement-officer', name: '' });
      setShowForm(false);
      fetchTeam();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/company/team/${memberId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('Membre supprimé avec succès');
      fetchTeam();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  const roles = {
    'procurement-officer': 'Responsable Achats',
    'director': 'Directeur',
    'accountant': 'Comptable',
    'viewer': 'Spectateur'
  };

  return (
    <div className="team-management">
      <h1>👥 Gestion de l'Équipe</h1>

      <button 
        className="btn btn-primary add-member-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Annuler' : '➕ Ajouter un Membre'}
      </button>

      {showForm && (
        <form onSubmit={handleAddMember} className="member-form">
          <h2>Ajouter un Nouveau Membre</h2>

          <div className="form-group">
            <label>Nom Complet:</label>
            <input 
              type="text"
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              placeholder="Entrez le nom du membre"
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              placeholder="exemple@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Rôle:</label>
            <select 
              value={newMember.role}
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
            >
              <option value="procurement-officer">Responsable Achats</option>
              <option value="director">Directeur</option>
              <option value="accountant">Comptable</option>
              <option value="viewer">Spectateur</option>
            </select>
          </div>

          <button type="submit" className="btn btn-success">✓ Ajouter le Membre</button>
        </form>
      )}

      {/* Liste du Fériqu */}
      <div className="team-list">
        {team.length === 0 ? (
          <p className="empty-state">Aucun membre dans l'équipe</p>
        ) : (
          <table className="team-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td><span className="role-badge">{roles[member.role] || member.role}</span></td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
