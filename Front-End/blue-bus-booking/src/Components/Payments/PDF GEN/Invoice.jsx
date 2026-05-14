import React from 'react';
import { FileText, Receipt, User, Mail, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

const Invoice = ({ booking, paymentData }) => {
  if (!booking) return null;

  const paymentMethod = paymentData?.paymentMethod || 'Razorpay / UPI';

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 font-sans">
      {/* Header */}
      <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">TAX INVOICE</h2>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Official Receipt</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Invoice Number</p>
          <p className="text-xl font-mono">INV-{booking.id}-{new Date().getFullYear()}</p>
        </div>
      </div>

      <div className="p-8">
        {/* Billing Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 pb-12 border-b border-gray-100">
          <div>
            <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={12} className="text-blue-600" /> Billed To
            </h4>
            <p className="text-xl font-black text-gray-800 mb-1">{booking.passengers?.[0]?.name || "Customer"}</p>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <Mail size={14} /> {booking.contactEmail || localStorage.getItem('userEmail') || 'customer@example.com'}
            </p>
            <p className="text-gray-500 text-sm mt-1">{booking.contactPhone || '+91 XXXX XXXX'}</p>
          </div>
          
          <div className="md:text-right">
            <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 justify-end">
              <Calendar size={12} className="text-blue-600" /> Invoice Details
            </h4>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-700">Date: <span className="font-normal text-gray-500">{new Date().toLocaleDateString()}</span></p>
              <p className="text-sm font-bold text-gray-700">Booking Date: <span className="font-normal text-gray-500">{new Date(booking.bookingTime).toLocaleDateString()}</span></p>
              <p className="text-sm font-bold text-gray-700">Payment Status: <span className="text-green-600 font-black uppercase text-[10px] bg-green-50 px-2 py-1 rounded-full ml-1">Paid</span></p>
            </div>
          </div>
        </div>

        {/* Item Table */}
        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="text-left py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
              <th className="text-center py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Qty</th>
              <th className="text-right py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr>
              <td className="py-6">
                <p className="font-black text-gray-800">Bus Ticket Booking</p>
                <p className="text-xs text-gray-500 mt-1">
                  {booking.trip?.route?.source} to {booking.trip?.route?.destination} ({booking.passengers?.length} Seat/s)
                </p>
              </td>
              <td className="text-center py-6 text-gray-600 font-bold">{booking.passengers?.length}</td>
              <td className="text-right py-6 font-black text-gray-800">₹{booking.totalAmount}</td>
            </tr>
            {booking.totalAmount > booking.finalAmount && (
              <tr>
                <td className="py-6 text-green-600 font-bold">Discount {booking.appliedCouponCode ? `(Coupon: ${booking.appliedCouponCode})` : ''}</td>
                <td className="text-center py-6 text-green-600 font-bold">-</td>
                <td className="text-right py-6 font-black text-green-600">- ₹{(booking.totalAmount - booking.finalAmount).toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 inline-block">
              <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                <CreditCard size={14} /> Payment Method
              </p>
              <p className="text-sm font-black text-blue-900">{paymentMethod}</p>
              <div className="flex items-center gap-1 mt-4 text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={12} /> Securely Processed
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-4">
            <div className="flex justify-between text-gray-500">
              <span className="font-bold text-sm">Subtotal</span>
              <span className="font-bold">₹{booking.totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span className="font-bold text-sm">GST (Included)</span>
              <span className="font-bold">₹0.00</span>
            </div>
            <div className="pt-4 border-t-2 border-gray-100 flex justify-between items-center">
              <span className="text-xl font-black text-gray-900 uppercase">Total</span>
              <span className="text-3xl font-black text-blue-600 tracking-tighter">₹{booking.finalAmount}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium">Thank you for traveling with Blue Bus. This is a computer generated invoice and does not require a physical signature.</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
