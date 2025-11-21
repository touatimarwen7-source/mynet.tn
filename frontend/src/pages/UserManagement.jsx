import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({ role: '', status: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams(Object.entries(filter).filter(([_, v]) => v));
      const response = await axios.get(`http://localhost:5000/api/admin/users?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, enabled) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { enabled },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      alert('تم تحديث الحالة بنجاح');
      fetchUsers();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  const handleApproveKYC = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/kyc-approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      alert('تم الموافقة على KYC');
      fetchUsers();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  const handleRejectKYC = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/kyc-reject`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      alert('تم رفض KYC');
      fetchUsers();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="user-management">
      <h1>إدارة المستخدمين</h1>

      {/* المرشحات */}
      <div className="filters-panel">
        <div className="filter-group">
          <label>الدور:</label>
          <select value={filter.role} onChange={(e) => setFilter({...filter, role: e.target.value})}>
            <option value="">الكل</option>
            <option value="buyer">مشتري</option>
            <option value="supplier">مورد</option>
            <option value="admin">إدارة</option>
          </select>
        </div>

        <div className="filter-group">
          <label>الحالة:</label>
          <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
            <option value="">الكل</option>
            <option value="active">نشط</option>
            <option value="inactive">معطل</option>
          </select>
        </div>
      </div>

      {/* جدول المستخدمين */}
      {users.length === 0 ? (
        <p className="empty-state">لا يوجد مستخدمون</p>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>الدور</th>
                <th>KYC</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td className={`kyc-status kyc-${user.kyc_status}`}>
                    {user.kyc_status}
                  </td>
                  <td>
                    <span className={`status ${user.enabled ? 'active' : 'inactive'}`}>
                      {user.enabled ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-toggle"
                        onClick={() => handleToggleStatus(user.id, !user.enabled)}
                      >
                        {user.enabled ? 'تعطيل' : 'تفعيل'}
                      </button>
                      {user.kyc_status === 'pending' && user.role === 'supplier' && (
                        <>
                          <button 
                            className="btn-approve"
                            onClick={() => handleApproveKYC(user.id)}
                          >
                            الموافقة
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleRejectKYC(user.id)}
                          >
                            رفض
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
