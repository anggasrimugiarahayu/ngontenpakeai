export type PaymentMethodKey = 
  | 'BCA_VA' | 'BNI_VA' | 'BRI_VA' | 'MANDIRI_VA' | 'PERMATA_VA' | 'CIMB_VA' | 'OTHER_VA'
  | 'QRIS' | 'GOPAY' | 'SHOPEEPAY' | 'OVO' | 'DANA'
  | 'ALFAMART' | 'INDOMARET'
  | 'CREDIT_CARD' | 'AKULAKU' | 'KREDIVO';

export interface PaymentMethodDef {
  name: string;
  enabled: string[];
  feeType: 'FIXED' | 'MDR_NO_PPN' | 'MDR_PLUS_PPN';
  fixedFee?: number;
  mdr?: number;
  iconUrl?: string;
}

export const PAYMENT_METHODS: Record<PaymentMethodKey, PaymentMethodDef> = {
  BCA_VA:      { name: 'BCA Virtual Account', enabled: ['bca_va'], feeType: 'FIXED', fixedFee: 4000, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" },
  BNI_VA:      { name: 'BNI Virtual Account', enabled: ['bni_va'], feeType: 'FIXED', fixedFee: 4000, iconUrl: "https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg" },
  BRI_VA:      { name: 'BRI Virtual Account', enabled: ['bri_va'], feeType: 'FIXED', fixedFee: 4000, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg" },
  MANDIRI_VA:  { name: 'Mandiri Virtual Account', enabled: ['echannel'], feeType: 'FIXED', fixedFee: 4000, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_of_Bank_Mandiri_%282016%29.svg" },
  PERMATA_VA:  { name: 'Permata Virtual Account', enabled: ['permata_va'], feeType: 'FIXED', fixedFee: 4000, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/3/38/PermataBank_Logo_2024.svg" },
  CIMB_VA:     { name: 'CIMB Niaga Virtual Account', enabled: ['cimb_va'], feeType: 'FIXED', fixedFee: 4000, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/CIMB_Niaga_logo.svg" },
  OTHER_VA:    { name: 'Other Virtual Account', enabled: ['other_va'], feeType: 'FIXED', fixedFee: 4000 },
  
  QRIS:        { name: 'QRIS', enabled: ['other_qris'], feeType: 'MDR_NO_PPN', mdr: 0.007, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" },
  GOPAY:       { name: 'GoPay', enabled: ['gopay'], feeType: 'MDR_PLUS_PPN', mdr: 0.02, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg" },
  SHOPEEPAY:   { name: 'ShopeePay', enabled: ['shopeepay'], feeType: 'MDR_PLUS_PPN', mdr: 0.02, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fe/ShopeePay_Logo.png" },
  OVO:         { name: 'OVO', enabled: ['ovo'], feeType: 'MDR_NO_PPN', mdr: 0.015, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg" },
  DANA:        { name: 'DANA', enabled: ['dana'], feeType: 'MDR_NO_PPN', mdr: 0.015, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" },

  ALFAMART:    { name: 'Alfamart', enabled: ['alfamart'], feeType: 'FIXED', fixedFee: 5000, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/Alfamart_logo.svg" },
  INDOMARET:   { name: 'Indomaret', enabled: ['indomaret'], feeType: 'FIXED', fixedFee: 5000, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Indomaret.png" },

  CREDIT_CARD: { name: 'Credit Card', enabled: ['credit_card'], feeType: 'MDR_NO_PPN', mdr: 0.029, iconUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
  AKULAKU:     { name: 'Akulaku PayLater', enabled: ['akulaku'], feeType: 'MDR_PLUS_PPN', mdr: 0.015 },
  KREDIVO:     { name: 'Kredivo', enabled: ['kredivo'], feeType: 'MDR_PLUS_PPN', mdr: 0.015 }
};

export function calculatePaymentFees(baseAmount: number, methodKey: PaymentMethodKey) {
  const method = PAYMENT_METHODS[methodKey];
  let adminFee = 0;
  
  if (method.feeType === 'FIXED') {
    adminFee = method.fixedFee || 0;
  } else if (method.feeType === 'MDR_NO_PPN') {
    adminFee = Math.round(baseAmount * (method.mdr || 0));
  } else if (method.feeType === 'MDR_PLUS_PPN') {
    const rawMdr = baseAmount * (method.mdr || 0);
    const mdrPpn = rawMdr * 0.11;
    adminFee = Math.round(rawMdr + mdrPpn);
  }

  const grossAmount = baseAmount + adminFee;
  
  return {
    baseAmount,
    adminFee,
    grossAmount,
    method
  };
}
