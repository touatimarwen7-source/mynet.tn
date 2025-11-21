import { useState, useEffect } from 'react';
import axios from 'axios';

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
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/company/team', {
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
      await axios.post('http://localhost:5000/api/company/team', newMember, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم إضافة العضو بنجاح');
      setNewMember({ email: '', role: 'procurement-officer', name: '' });
      setShowForm(false);
      fetchTeam();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('هل تأكد من حذف العضو؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/company/team/${memberId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم حذف العضو بنجاح');
      fetchTeam();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  const roles = {
    'procurement-officer': 'مسؤول المشتريات',
    'director': 'المدير',
    'accountant': 'محاسب',
    'viewer': 'مشاهد'
  };

  return (
    <div className="team-management">
      <h1>إدارة الفريق</h1>

      <button 
        className="btn btn-primary add-member-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'إلغاء' : '+ إضافة عضو جديد'}
      </button>

      {showForm && (
        <form onSubmit={handleAddMember} className="member-form">
          <h2>إضافة عضو جديد</h2>

          <div className="form-group">
            <label>الاسم:</label>
            <input 
              type="text"
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني:</label>
            <input 
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>الدور:</label>
            <select 
              value={newMember.role}
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
            >
              <option value="procurement-officer">مسؤول المشتريات</option>
              <option value="director">المدير</option>
              <option value="accountant">محاسب</option>
              <option value="viewer">مشاهد</option>
            </select>
          </div>

          <button type="submit" className="btn btn-success">إضافة العضو</button>
        </form>
      )}

      {/* قائمة الفريق */}
      <div className="team-list">
        {team.length === 0 ? (
          <p className="empty-state">لا يوجد أعضاء في الفريق</p>
        ) : (
          <table className="team-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {team.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{roles[member.role] || member.role}</td>
                  <td>
                    <button 
                      className="btn-delete"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      حذف
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
