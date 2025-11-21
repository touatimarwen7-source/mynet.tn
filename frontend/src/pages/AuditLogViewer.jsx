import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState({ action: '', user_id: '', date_from: '', date_to: '' });
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const queryParams = new URLSearchParams(Object.entries(filter).filter(([_, v]) => v));
      const response = await axios.get(`http://localhost:5000/api/admin/audit-logs?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/audit-logs/export/${format}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        responseType: format === 'csv' ? 'blob' : 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs.${format === 'csv' ? 'csv' : 'jsonl'}`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      alert('خطأ في التصدير');
    }
  };

  const DiffView = ({ oldValue, newValue }) => (
    <div className="diff-view">
      <div className="diff-old">
        <h4>القيمة القديمة:</h4>
        <pre>{JSON.stringify(oldValue, null, 2)}</pre>
      </div>
      <div className="diff-new">
        <h4>القيمة الجديدة:</h4>
        <pre>{JSON.stringify(newValue, null, 2)}</pre>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="audit-log-viewer">
      <h1>سجل التدقيق الشامل</h1>

      {/* المرشحات */}
      <div className="filters-panel">
        <div className="filter-group">
          <label>الإجراء:</label>
          <select 
            value={filter.action} 
            onChange={(e) => setFilter({...filter, action: e.target.value})}
          >
            <option value="">الكل</option>
            <option value="CREATE">إنشاء</option>
            <option value="UPDATE">تحديث</option>
            <option value="DELETE">حذف</option>
            <option value="APPROVE">موافقة</option>
            <option value="LOGIN">دخول</option>
          </select>
        </div>

        <div className="filter-group">
          <label>من:</label>
          <input 
            type="date" 
            value={filter.date_from}
            onChange={(e) => setFilter({...filter, date_from: e.target.value})}
          />
        </div>

        <div className="filter-group">
          <label>إلى:</label>
          <input 
            type="date" 
            value={filter.date_to}
            onChange={(e) => setFilter({...filter, date_to: e.target.value})}
          />
        </div>
      </div>

      {/* أزرار التصدير */}
      <div className="export-buttons">
        <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
          📥 تصدير CSV
        </button>
        <button className="btn btn-secondary" onClick={() => handleExport('jsonl')}>
          📥 تصدير JSON-L
        </button>
      </div>

      {/* جدول السجلات */}
      {logs.length === 0 ? (
        <p className="empty-state">لا توجد سجلات</p>
      ) : (
        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>الإجراء</th>
                <th>المستخدم</th>
                <th>الكائن</th>
                <th>عنوان IP</th>
                <th>التاريخ والوقت</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx}>
                  <td><span className={`action-badge action-${log.action}`}>{log.action}</span></td>
                  <td>{log.user_email}</td>
                  <td>{log.entity_type} #{log.entity_id}</td>
                  <td>{log.ip_address}</td>
                  <td>{new Date(log.created_at).toLocaleString('ar-TN')}</td>
                  <td>
                    <button 
                      className="btn-details"
                      onClick={() => setSelectedLog(log)}
                    >
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Diff View Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>مقارنة التغييرات</h2>
              <button className="btn-close" onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className="modal-body">
              <DiffView 
                oldValue={selectedLog.old_value} 
                newValue={selectedLog.new_value}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
