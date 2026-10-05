import React, { useEffect } from 'react';
import { X, Send } from 'lucide-react';

export default function WhatsAppModal({ 
  isOpen, 
  onClose, 
  order, 
  message, 
  setMessage 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  order: any; 
  message: string; 
  setMessage: (m: string) => void;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const sanitizePhone = (phone: string) => {
    if (!phone) return '';
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.substring(1);
    if (!p.startsWith('62') && !p.startsWith('0')) p = '62' + p; 
    return p;
  };

  const handleSend = () => {
    const phone = sanitizePhone(order.user?.phone || order.customerPhone);
    if (!phone) {
      alert("Nomor telepon pembeli tidak ditemukan!");
      return;
    }
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#121214] w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">WhatsApp Follow Up</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pesan untuk {order.user?.name || 'Pembeli'}:
          </label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-48 p-4 bg-gray-50 dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none"
            placeholder="Ketik pesan Anda di sini..."
          />
          <p className="text-xs text-gray-500 mt-3">
            Nomor tujuan: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">+{sanitizePhone(order.user?.phone || order.customerPhone || '0000')}</span>
          </p>
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1c]">
          <button 
            onClick={handleSend}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Send className="w-5 h-5" />
            Kirim via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
