export type PaymentMethodKey = 
  | "QRIS"
  | "GOPAY"
  | "SHOPEEPAY"
  | "OVO"
  | "DANA"
  | "BCA_VA"
  | "BNI_VA"
  | "BRI_VA"
  | "MANDIRI_VA"
  | "PERMATA_VA"
  | "CIMB_VA"
  | "OTHER_VA"
  | "INDOMARET"
  | "ALFAMART"
  | "CREDIT_CARD"
  | "AKULAKU"
  | "KREDIVO";

export const PAYMENT_METHODS: Record<PaymentMethodKey, { 
  name: string; 
  enabled: string[]; 
  feeType: 'MDR_NO_PPN' | 'MDR_PPN' | 'FLAT_PPN' | 'MIXED_PPN'; 
  mdr?: number; 
  flat?: number;
  icon?: string;
}> = {
  QRIS: { name: 'QRIS', enabled: ['qris'], feeType: 'MDR_NO_PPN', mdr: 0.007 },
  GOPAY: { name: 'GoPay', enabled: ['gopay'], feeType: 'MDR_NO_PPN', mdr: 0.02 },
  SHOPEEPAY: { name: 'ShopeePay', enabled: ['shopeepay'], feeType: 'MDR_NO_PPN', mdr: 0.02 },
  OVO: { name: 'OVO', enabled: ['ovo'], feeType: 'MDR_PPN', mdr: 0.015 },
  DANA: { name: 'DANA', enabled: ['dana'], feeType: 'MDR_PPN', mdr: 0.015 },
  
  BCA_VA: { name: 'BCA Virtual Account', enabled: ['bca_va'], feeType: 'FLAT_PPN', flat: 4000 },
  BNI_VA: { name: 'BNI Virtual Account', enabled: ['bni_va'], feeType: 'FLAT_PPN', flat: 4000 },
  BRI_VA: { name: 'BRI Virtual Account', enabled: ['bri_va'], feeType: 'FLAT_PPN', flat: 4000 },
  MANDIRI_VA: { name: 'Mandiri Virtual Account', enabled: ['mandiri_va'], feeType: 'FLAT_PPN', flat: 4000 },
  PERMATA_VA: { name: 'Permata Virtual Account', enabled: ['permata_va'], feeType: 'FLAT_PPN', flat: 4000 },
  CIMB_VA: { name: 'CIMB Niaga Virtual Account', enabled: ['cimb_va'], feeType: 'FLAT_PPN', flat: 4000 },
  OTHER_VA: { name: 'Other Bank Virtual Account', enabled: ['other_va'], feeType: 'FLAT_PPN', flat: 4000 },
  
  INDOMARET: { name: 'Indomaret', enabled: ['indomaret'], feeType: 'FLAT_PPN', flat: 5000 },
  ALFAMART: { name: 'Alfamart', enabled: ['alfamart'], feeType: 'FLAT_PPN', flat: 5000 },
  
  CREDIT_CARD: { name: 'Kartu Kredit', enabled: ['credit_card'], feeType: 'MIXED_PPN', mdr: 0.029, flat: 2000 },
  AKULAKU: { name: 'Akulaku PayLater', enabled: ['akulaku'], feeType: 'MDR_PPN', mdr: 0.017 },
  KREDIVO: { name: 'Kredivo', enabled: ['kredivo'], feeType: 'MDR_PPN', mdr: 0.02 },
};

export function calculatePaymentFees(baseAmount: number, methodKey: PaymentMethodKey) {
  const method = PAYMENT_METHODS[methodKey];
  let grossAmount = baseAmount;
  
  if (method.feeType === 'MDR_NO_PPN') {
    grossAmount = baseAmount / (1 - (method.mdr || 0));
  } else if (method.feeType === 'MDR_PPN') {
    const effectiveMdr = (method.mdr || 0) * 1.11;
    grossAmount = baseAmount / (1 - effectiveMdr);
  } else if (method.feeType === 'FLAT_PPN') {
    const effectiveFlat = (method.flat || 0) * 1.11;
    grossAmount = baseAmount + effectiveFlat;
  } else if (method.feeType === 'MIXED_PPN') {
    const effectiveMdr = (method.mdr || 0) * 1.11;
    const effectiveFlat = (method.flat || 0) * 1.11;
    grossAmount = (baseAmount + effectiveFlat) / (1 - effectiveMdr);
  }

  grossAmount = Math.ceil(grossAmount);
  const adminFee = grossAmount - baseAmount;

  return { grossAmount, adminFee };
}
