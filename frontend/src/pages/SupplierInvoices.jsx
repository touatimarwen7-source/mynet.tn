import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SupplierInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/supplier/invoices?status=${filter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('خطأ:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="supplier-invoices">
      <h1>إدارة الفواتير</h1>

      {/* التصفية */}
      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          الكل
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          قيد الانتظار
        </button>
        <button 
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          موافق عليها
        </button>
        <button 
          className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          مدفوعة
        </button>
      </div>

      {/* جدول الفواتير */}
      {invoices.length === 0 ? (
        <p className="empty-state">لا توجد فواتير</p>
      ) : (
        <div className="invoices-table-wrapper">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>أمر الشراء</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.number}</td>
                  <td>{invoice.po_number}</td>
                  <td>{invoice.amount} {invoice.currency}</td>
                  <td>{new Date(invoice.date).toLocaleDateString('ar-TN')}</td>
                  <td className={`status status-${invoice.status}`}>{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
