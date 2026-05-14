import React from 'react';
import { CreditCard, Smartphone, Globe, Banknote, HelpCircle } from 'lucide-react';

const paymentOptions = [
  { id: 'UPI', label: 'UPI / QR', icon: <Smartphone size={18} /> },
  { id: 'CARD', label: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
  { id: 'NET_BANKING', label: 'Net Banking', icon: <Globe size={18} /> },
  { id: 'CASH', label: 'Cash', icon: <Banknote size={18} /> },
  { id: 'UNKNOWN', label: 'Other', icon: <HelpCircle size={18} /> },
];

const PaymentMethods = ({ selectedMethod, onSelectMethod }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8 mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCard size={20} className="text-blue-600" /> Choose Payment Method
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentOptions.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelectMethod(method.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <div className={selectedMethod === method.id ? 'text-blue-600' : 'text-gray-400'}>
              {method.icon}
            </div>
            <span className="font-medium text-sm">{method.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
