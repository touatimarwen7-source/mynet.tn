import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SupplierCatalog() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    specifications: '',
    price: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/supplier/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/supplier/products', newProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم إضافة المنتج بنجاح');
      setNewProduct({ name: '', category: '', description: '', specifications: '', price: 0 });
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('هل تأكد من الحذف؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/supplier/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      alert('تم حذف المنتج بنجاح');
      fetchProducts();
    } catch (error) {
      alert('خطأ: ' + error.response?.data?.error || 'قد يكون المنتج مرتبطاً بعرض نشط');
    }
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;

  return (
    <div className="supplier-catalog">
      <h1>إدارة المنتجات والخدمات</h1>

      <button 
        className="btn btn-primary add-product-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'إلغاء' : '+ إضافة منتج/خدمة جديد'}
      </button>

      {/* نموذج إضافة منتج */}
      {showForm && (
        <form onSubmit={handleAddProduct} className="product-form">
          <h2>مواصفات المنتج/الخدمة</h2>

          <div className="form-group">
            <label>اسم المنتج:</label>
            <input 
              type="text" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>الفئة:</label>
            <select 
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              required
            >
              <option value="">اختر الفئة</option>
              <option value="supplies">إمدادات</option>
              <option value="services">خدمات</option>
              <option value="construction">بناء</option>
            </select>
          </div>

          <div className="form-group">
            <label>الوصف:</label>
            <textarea 
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>المواصفات التقنية:</label>
            <textarea 
              value={newProduct.specifications}
              onChange={(e) => setNewProduct({...newProduct, specifications: e.target.value})}
              placeholder="استخدم قالب المواصفات القياسي"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>السعر الأساسي:</label>
            <input 
              type="number" 
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-success">حفظ المنتج</button>
        </form>
      )}

      {/* قائمة المنتجات */}
      <div className="products-grid">
        {products.length === 0 ? (
          <p className="empty-state">لم تقم بإضافة أي منتجات بعد</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p><strong>الفئة:</strong> {product.category}</p>
              <p>{product.description}</p>
              <p className="price">{product.price} د.ت</p>
              <div className="actions">
                <button className="btn-edit">تعديل</button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
