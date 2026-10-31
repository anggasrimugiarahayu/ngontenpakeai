import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PrintModal({ isOpen, onClose, order }: { isOpen: boolean, onClose: () => void, order: any }) {
  const { data: session } = useSession();
  
  const [showLogo, setShowLogo] = useState(true);
  const [hideProduct, setHideProduct] = useState(false);
  const [showNote, setShowNote] = useState(true);
  const [size, setSize] = useState<'100mm' | '58mm'>('100mm');
  
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-transparent print:backdrop-blur-none p-4">
      <div className="bg-gray-50 dark:bg-[#0A1128] w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative print:hidden border border-gray-200 dark:border-[#2C3246]">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-[#141B31] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-[#1C2542] shadow-sm border border-gray-200 dark:border-[#2C3246] cursor-pointer transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="w-full md:w-[340px] bg-white dark:bg-[#141B31] p-6 sm:p-8 border-r border-gray-200 dark:border-[#2C3246] flex flex-col shrink-0 overflow-y-auto">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-[#2C3246]/50 pb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-bold text-sm tracking-wide">LABEL OPTION</h3>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-6 flex-1">
            <Toggle label="Show store logo" checked={showLogo} onChange={setShowLogo} />
            <Toggle label="Hide product info" checked={hideProduct} onChange={setHideProduct} />
            <Toggle label="Show order note" checked={showNote} onChange={setShowNote} />
            <Toggle label="Print for thermal printer (58mm)" checked={size === '58mm'} onChange={() => { setSize('58mm'); }} />
            <Toggle label="Print for thermal printer (100mm)" checked={size === '100mm'} onChange={() => { setSize('100mm'); }} />
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={handlePrint} className="flex-1 py-3 border-2 border-orange-500 text-orange-500 font-bold rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors text-sm">
              Export as PDF
            </button>
            <button onClick={handlePrint} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-sm shadow-md shadow-orange-500/20">
              Print Now
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#f0f2f5] dark:bg-black/60 p-6 sm:p-10 flex flex-col overflow-y-auto items-center">
          <h3 className="text-gray-500 dark:text-gray-400 font-bold text-sm tracking-wide mb-8 self-start w-full max-w-[450px] mx-auto">LABEL PREVIEW ({size})</h3>
          
          <div className={`bg-white text-black shrink-0 shadow-lg border border-dashed border-gray-300 relative transition-all duration-300 ${size === '100mm' ? 'w-full max-w-[450px]' : 'w-[280px]'}`}>
             <ReceiptContent order={order} showLogo={showLogo} hideProduct={hideProduct} showNote={showNote} size={size} session={session} />
          </div>
        </div>
      </div>

      <div id="print-area" className="hidden print:block absolute top-0 left-0 bg-white text-black" style={{ width: size === '100mm' ? '100mm' : '58mm', padding: '0', margin: '0' }}>
         <ReceiptContent order={order} showLogo={showLogo} hideProduct={hideProduct} showNote={showNote} size={size} session={session} />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex justify-between items-center gap-4 cursor-pointer" onClick={() => onChange(!checked)}>
      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 select-none">{label}</span>
      <button 
        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${checked ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function ReceiptContent({ order, showLogo, hideProduct, showNote, size, session }: { order: any, showLogo: boolean, hideProduct: boolean, showNote: boolean, size: string, session: any }) {
  const trxId = order.midtransId || `#${order.id || 'TRX-UNKNOWN'}`;
  
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };
  
  const senderName = session?.user?.name || 'Toko Digital';
  const senderPhone = session?.user?.phone || '-';
  const senderImage = session?.user?.image;
  
  const receiverName = order.user?.name || order.customerName || 'Pelanggan';
  const receiverEmail = order.user?.email || order.customerEmail || '-';
  const receiverPhone = order.user?.phone || order.customerPhone || '-';
  const notes = order.note || '-';
  const addonList = Array.isArray(order.addons) ? order.addons : [];
  const addonCount = addonList.length;
  const totalAddonPrice = addonList.reduce((sum: number, a: any) => sum + (a.price || 0), 0);

  let mainItemPrice = order.product?.price;
  if (!mainItemPrice || mainItemPrice <= 0) {
    if (order.orderType === 'PRO_BOOK' || order.orderType === 'PRO_TOOLS') {
      mainItemPrice = 99000;
    } else if (order.orderType === 'PRO_PLUS') {
      mainItemPrice = 149000;
    } else {
      mainItemPrice = Math.max(0, (order.amount || 0) - totalAddonPrice + (order.discountAmount || 0));
    }
  }

  const subtotalNet = (mainItemPrice || 0) + totalAddonPrice - (order.discountAmount || 0);
  const convenienceFee = Math.max(0, (order.amount || 0) - subtotalNet);

  return (
    <div className="p-5 font-mono text-[12px] leading-tight text-gray-900 bg-white">
      {showLogo && (
        <div className="mb-4">
          {senderImage ? (
            <img src={senderImage} alt="Store Logo" className="w-12 h-12 object-cover rounded-md" />
          ) : (
            <div className="w-12 h-12 bg-gray-900 text-white font-black leading-none text-[9px] p-1.5 uppercase flex items-center justify-center tracking-tighter text-center rounded-md">
              STORE<br/>LOGO
            </div>
          )}
        </div>
      )}
      
      <div className="text-center border-b border-t border-gray-900 py-3 mb-4">
        <h2 className="font-bold text-base mb-1">INVOICE TRANSAKSI DIGITAL</h2>
        <p className="text-[11px] break-all">{trxId}</p>
      </div>

      <div className={`flex ${size === '58mm' ? 'flex-col space-y-4' : 'justify-between gap-4'} mb-4 border-b border-gray-900 pb-4`}>
        <div className="flex-1">
          <p className="font-bold mb-2 text-[10px] text-gray-500">PENJUAL</p>
          <p className="font-bold mb-1">{senderName}</p>
          <p>{senderPhone}</p>
        </div>
        <div className="flex-1">
          <p className="font-bold mb-2 text-[10px] text-gray-500">PEMBELI</p>
          <p className="font-bold mb-1">{receiverName}</p>
          <p className="break-words" style={{ wordBreak: 'break-all' }}>{receiverEmail}</p>
          <p>{receiverPhone}</p>
        </div>
      </div>

      <div className="mb-5 border-b border-gray-900 pb-4 space-y-2">
        <p className="font-bold mb-3 text-[10px] text-gray-500">INFORMASI TRANSAKSI</p>
        <div className="flex justify-between">
          <span>Total Item ({1} item)</span>
          <span>{formatIDR(mainItemPrice)}</span>
        </div>
        {addonCount > 0 && (
          <div className="flex justify-between">
            <span>Total Addon ({addonCount} item)</span>
            <span>{formatIDR(totalAddonPrice)}</span>
          </div>
        )}
        {convenienceFee > 0 && (
          <div className="flex justify-between">
            <span>Convenience fee</span>
            <span>{formatIDR(convenienceFee)}</span>
          </div>
        )}
        {order.discountAmount && order.discountAmount > 0 ? (
          <div className="flex justify-between">
            <span>Discount {order.voucherCode ? `(${order.voucherCode})` : ''}</span>
            <span>- {formatIDR(order.discountAmount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Total Harga</span>
          <span className="font-bold">{formatIDR(order.amount || 0)}</span>
        </div>
        <div className="text-center mt-6 text-gray-400 text-[10px]">
          Powered by <span className="font-bold text-gray-500">ruangcreativemuslim</span>
        </div>
      </div>

      <div className="space-y-3">
        {!hideProduct && (
          <>
            <p className="uppercase leading-relaxed">1x {order.product?.title || 'Produk Digital'}</p>
            {order.addons?.map((addon: any, idx: number) => (
              <p key={idx} className="uppercase leading-relaxed text-gray-700">1x (Add-on) {addon.title}</p>
            ))}
          </>
        )}
        {showNote && (
          <p>Notes:<br/>{notes}</p>
        )}
      </div>
    </div>
  );
}
