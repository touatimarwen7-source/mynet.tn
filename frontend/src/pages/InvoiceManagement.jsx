import { useState, useEffect } from 'react';
import axios from 'axios';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/procurement/invoices?status=${filter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (invoiceId) => {
    try {
      await axios.put(`http://localhost:5000/api/procurement/invoices/${invoiceId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم الموافقة على الفاتورة');
      fetchInvoices();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  const handleReject = async (invoiceId) => {
    try {
      await axios.put(`http://localhost:5000/api/procurement/invoices/${invoiceId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم رفض الفاتورة');
      fetchInvoices();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  const handlePushToERP = async (invoiceId) => {
    try {
      await axios.post(`http://localhost:5000/api/procurement/invoices/${invoiceId}/push-to-erp`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم الإرسال إلى نظام ERP بنجاح');
      fetchInvoices();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="invoice-management">
      <h1>إدارة الفواتير</h1>

      {/* التصفية */}
      <div className="filters">
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
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          مرفوضة
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
        <p className="empty-state">لا توجد فواتير في هذه الفئة</p>
      ) : (
        <div className="invoices-table-wrapper">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>المورد</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.number}</td>
                  <td>{invoice.supplier_name}</td>
                  <td>{invoice.amount} {invoice.currency}</td>
                  <td>{new Date(invoice.date).toLocaleDateString('ar-TN')}</td>
                  <td className={`status status-${invoice.status}`}>{invoice.status}</td>
                  <td className="actions">
                    {invoice.status === 'pending' && (
                      <>
                        <button 
                          className="btn-approve"
                          onClick={() => handleApprove(invoice.id)}
                        >
                          موافقة
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleReject(invoice.id)}
                        >
                          رفض
                        </button>
                      </>
                    )}
                    {invoice.status === 'approved' && (
                      <button 
                        className="btn-erp"
                        onClick={() => handlePushToERP(invoice.id)}
                      >
                        إرسال ERP
                      </button>
                    )}
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
