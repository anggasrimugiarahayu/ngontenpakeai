export type PaymentMethodKey = 
  | "QRIS"
  | "GOPAY"
  | "SHOPEEPAY"
  | "OVO"
  | "DANA"
  | "VA"
  | "CREDIT_CARD"
  | "MINIMARKET"
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
  VA: { name: 'Virtual Account (Transfer Bank)', enabled: ['bca_va', 'bni_va', 'bri_va', 'mandiri_va', 'permata_va', 'other_va', 'cimb_va'], feeType: 'FLAT_PPN', flat: 4000 },
  MINIMARKET: { name: 'Minimarket (Indomaret / Alfamart)', enabled: ['indomaret', 'alfamart'], feeType: 'FLAT_PPN', flat: 5000 },
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
