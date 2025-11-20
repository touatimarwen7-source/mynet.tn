import { useState, useEffect } from 'react';
import { procurementAPI } from '../api';

export default function AuditLog({ tenderId }) {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ eventType: '', userId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, [tenderId, filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await procurementAPI.getAuditLogs(tenderId, filters);
      // ترتيب عكسي زمني
      const sortedLogs = (response.data.logs || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setLogs(sortedLogs);
    } catch (error) {
      console.error('خطأ في تحميل سجل التدقيق:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audit-log-container">
      <h3>سجل التدقيق - التغييرات غير القابلة للتعديل</h3>
      
      <div className="audit-filters">
        <select 
          value={filters.eventType}
          onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
        >
          <option value="">جميع الأحداث</option>
          <option value="create">إنشاء</option>
          <option value="update">تحديث</option>
          <option value="delete">حذف</option>
          <option value="publish">نشر</option>
          <option value="close">إغلاق</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">جاري التحميل...</div>
      ) : logs.length === 0 ? (
        <div className="alert alert-info">لا توجد سجلات</div>
      ) : (
        <div className="audit-log-table">
          <table>
            <thead>
              <tr>
                <th>التاريخ والوقت</th>
                <th>المستخدم</th>
                <th>نوع الحدث</th>
                <th>التفاصيل</th>
                <th>عنوان IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx}>
                  <td>{new Date(log.created_at).toLocaleString('ar-TN')}</td>
                  <td>{log.user_name || log.username}</td>
                  <td className={`event-type-${log.action}`}>{log.action}</td>
                  <td>{log.message || log.details}</td>
                  <td className="ip-address">{log.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
