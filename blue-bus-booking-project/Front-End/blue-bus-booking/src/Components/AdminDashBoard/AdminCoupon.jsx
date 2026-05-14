import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Percent, Plus, Edit2, Trash2, X, Check,
  Tag, Calendar, AlertTriangle, ShieldCheck, Zap
} from 'lucide-react';

const AdminCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [formData, setFormData] = useState({
    couponCode: '',
    description: '',
    discountAmount: '',
    minimumBookingAmount: '',
    isActive: true,
    expiryDate: ''
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get('http://localhost:8080/api/admin/coupons', { headers });
      setCoupons(res.data.data || []);
    } catch (err) {
      showMessage('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (editingItem) {
        await axios.put(`http://localhost:8080/api/admin/coupons/${editingItem.id}`, formData, { headers });
        showMessage('Coupon updated successfully', 'success');
      } else {
        await axios.post('http://localhost:8080/api/admin/coupons', formData, { headers });
        showMessage('Coupon created successfully', 'success');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.delete(`http://localhost:8080/api/admin/coupons/${selectedCouponId}`, { headers });
      showMessage('Coupon deleted successfully', 'success');
      setShowDeleteModal(false);
      fetchCoupons();
    } catch (err) {
      showMessage('Delete failed');
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ couponCode: '', description: '', discountAmount: '', minimumBookingAmount: '', isActive: true, expiryDate: '' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingItem(c);
    setFormData({
      couponCode: c.couponCode,
      description: c.description || '',
      discountAmount: c.discountAmount,
      minimumBookingAmount: c.minimumBookingAmount,
      isActive: c.isActive,
      expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notification.type === 'success' ? <ShieldCheck size={20} /> : <X size={20} />}
          <p className="text-sm font-black tracking-tight">{notification.msg}</p>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 mx-auto"><Trash2 size={40} /></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Coupon?</h2>
            <p className="text-sm text-slate-400 font-medium mb-8">This discount code will be permanently removed.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/20">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-[1.5rem] flex items-center justify-center shadow-inner">
            <Percent size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discount Coupons</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">Manage promotional discount codes.</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-8 py-4 bg-[#0d2694] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
        >
          <Plus size={18} /> New Coupon
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem]"></div>
          ))
        ) : coupons.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 text-amber-400 rounded-full flex items-center justify-center mb-4"><Percent size={32} /></div>
            <p className="font-black text-slate-900">No coupons found</p>
            <p className="text-sm text-slate-400 italic mt-1">Create your first discount code to get started.</p>
          </div>
        ) : (
          coupons.map(c => {
            const expired = isExpired(c.expiryDate);
            return (
              <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                {/* Watermark */}
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Tag size={120} />
                </div>

                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-bl-2xl ${
                  expired ? 'bg-rose-50 text-rose-400' : c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  {expired ? 'Expired' : c.isActive ? 'Active' : 'Disabled'}
                </div>

                {/* Coupon Code */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl font-black text-sm tracking-widest mb-6">
                  <Zap size={16} /> {c.couponCode}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-1">Save ₹{c.discountAmount}</h3>
                <p className="text-xs text-slate-400 italic mb-6">"{c.description || 'Limited time offer'}"</p>

                <div className="space-y-2 mb-8">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-slate-300" />
                    Min. booking: ₹{c.minimumBookingAmount}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar size={14} className="text-slate-300" />
                    Expires: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No expiry'}
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-50">
                  <button
                    onClick={() => openEdit(c)}
                    className="flex-1 py-3 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => { setSelectedCouponId(c.id); setShowDeleteModal(true); }}
                    className="p-3 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Percent size={24} /></div>
              <h2 className="text-2xl font-black text-slate-900">{editingItem ? 'Update' : 'Create'} Coupon</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Coupon Code</label>
                <input required type="text" value={formData.couponCode} onChange={e => setFormData({...formData, couponCode: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-sm uppercase focus:ring-2 focus:ring-blue-500" placeholder="e.g. SAVE100" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" placeholder="Short offer description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Discount (₹)</label>
                  <input required type="number" value={formData.discountAmount} onChange={e => setFormData({...formData, discountAmount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Min. Booking (₹)</label>
                  <input required type="number" value={formData.minimumBookingAmount} onChange={e => setFormData({...formData, minimumBookingAmount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Expiry Date</label>
                  <input required type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Status</label>
                  <select value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-[#0d2694] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                  <Check size={18} /> {editingItem ? 'Update' : 'Create'} Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupon;
