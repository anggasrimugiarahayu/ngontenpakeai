export type PaymentMethodKey = 
  | 'QRIS' | 'GOPAY' | 'SHOPEEPAY' | 'OVO' | 'DANA'
  | 'BCA_VA' | 'BNI_VA' | 'BRI_VA' | 'MANDIRI_VA' | 'PERMATA_VA' | 'CIMB_VA' | 'DANAMON_VA' | 'BSI_VA' | 'SEABANK_VA' | 'BANK_SAQU_VA'
  | 'ALFAMART' | 'ALFAMIDI' | 'DAN_DAN' | 'INDOMARET' 
  | 'CREDIT_CARD' | 'AKULAKU' | 'KREDIVO';

export interface PaymentMethodDef {
  name: string;
  enabled: string[];
  feeType: 'FIXED' | 'MDR_PLUS_PPN' | 'MDR_NO_PPN';
  fixedFee?: number;
  mdr?: number; // e.g. 0.02 for 2%
  iconUrls?: string[];
}

export const PAYMENT_METHODS: Record<PaymentMethodKey, PaymentMethodDef> = {
  BCA_VA:      { name: 'BCA Virtual Account', enabled: ['bca_va'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2020/09/fc68a00838f69124fddaf64e30f5e958_ca45aac69ce87ce691c3e6582894b6f0_compressed.png"] },
  BNI_VA:      { name: 'BNI Virtual Account', enabled: ['bni_va'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2020/09/f6f57e9126c57179cf729cc9586e47c0_e26ce4cce944fe379072ae509fe72ec1_compressed.png"] },
  BRI_VA:      { name: 'BRI Virtual Account', enabled: ['bri_va'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2020/09/0fcddd245474380834dfe5f3beb0492f_093eb297aba2188382cf91e556dd9bdf_compressed.png"] },
  MANDIRI_VA:  { name: 'Mandiri Virtual Account', enabled: ['echannel'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2020/09/11f8970a182ad8cf6aaf0a0cd22dd9ad_3948cb3bf5c4887c7cca7ca7ee421708_compressed.png"] },
  PERMATA_VA:  { name: 'Permata Virtual Account', enabled: ['permata_va'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2024/10/b8ed83a966c951414a2c0ababa0b6987_377d64303a92b5d124043e753ae85f64_compressed.png"] },
  CIMB_VA:     { name: 'CIMB Niaga Virtual Account', enabled: ['cimb_va'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2023/08/eabfa224d4b688115f1ccd828c6d2580_b8874e7d50b8a6b48a1a1f89c343e15a_compressed.png"] },
  DANAMON_VA:  { name: 'Danamon Virtual Account', enabled: ['danamon_va'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/05/efc7ddecc55c330345ff843bc2443548_4410e90f317df54a83b0a11c99a0266a_compressed.png"] },
  BSI_VA:      { name: 'BSI Virtual Account', enabled: ['bsi_va'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/01/e532a2a311c008bd57860e0d2421a1b1_9cef30936521d99ed6cfc577a02a98bd_compressed.png"] },
  SEABANK_VA:  { name: 'SeaBank Virtual Account', enabled: ['other_va'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/04/7081e17c1851295238c9d8529acbc77e_bd508f1768138381a0dd33789c5df099_compressed.png"] },
  BANK_SAQU_VA:{ name: 'Bank Saqu Virtual Account', enabled: ['other_va'], feeType: 'FIXED', fixedFee: 4000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/05/7ffcba9d4daaad2f524e6bb30a9d3191_3ae24228fd191e6c69254d394d729e0c_compressed.png"] },

  QRIS:        { name: 'QRIS', enabled: ['other_qris'], feeType: 'MDR_NO_PPN', mdr: 0.007, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/05/6237bef1c044ea522c682a8c7ac8ed96_50c21935c4ca616d555ac3545f93345e_compressed.png"] },
  GOPAY:       { name: 'GoPay', enabled: ['gopay'], feeType: 'MDR_PLUS_PPN', mdr: 0.02, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/05/1ac8e4338379d401b2f6c409a5c5b368_ff408617fe1bc56dc9d05aab777ff06f_compressed.png"] },
  SHOPEEPAY:   { name: 'ShopeePay', enabled: ['shopeepay'], feeType: 'MDR_PLUS_PPN', mdr: 0.02, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2020/10/f7fb2e0ab8572355142dba33ddc7b8d6_0747205be87147c03d04217ad4eb06c3_compressed.png"] },
  OVO:         { name: 'OVO', enabled: ['ovo'], feeType: 'MDR_NO_PPN', mdr: 0.015, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/03/9d5866d13585a012a6239d8a66601ebf_6d74d45eae27e8a5bddc0b64098cff68_compressed.png"] },
  DANA:        { name: 'DANA', enabled: ['dana'], feeType: 'MDR_NO_PPN', mdr: 0.015, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2024/11/c9386acd20eb0368a480d24e9ee6a664_8000f1aceb209912674e98494d376284_compressed.png"] },
  
  INDOMARET:   { name: 'Indomaret', enabled: ['indomaret'], feeType: 'FIXED', fixedFee: 5000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2025/03/8120a478a97dae6c25f295690a49dfe2_a4d8783f9cc51fd18a3d851cfc2aefb6_compressed.png"] },
  ALFAMART:    { name: 'Alfamart', enabled: ['alfamart'], feeType: 'FIXED', fixedFee: 5000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2020/09/0b49d7de63b2367e0515c1283060f64e_c16ca417c1f390206d3ccc6785df8f19_compressed.png"] },
  ALFAMIDI:    { name: 'Alfamidi', enabled: ['alfamart'], feeType: 'FIXED', fixedFee: 5000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2020/09/2fa42b3678e716f55a8c9ad9f563edf0_a458be79715b839f5667630e0955e278_compressed.png"] },
  DAN_DAN:     { name: 'Dan & Dan', enabled: ['alfamart'], feeType: 'FIXED', fixedFee: 5000, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2022/04/591f3458aaaacabff65548b2915254b6_ecb0a0e40ee85d357ec30233e45b4076_compressed.png"] },

  CREDIT_CARD: { name: 'Kartu Kredit / Debit', enabled: ['credit_card'], feeType: 'MDR_NO_PPN', mdr: 0.029, iconUrls: [
    "https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2021/02/00aaa14a79aa03a492d15d8b65c3db67_4fd1c9cf4a7ad34aa2334818eee806ee_compressed.png",
    "https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2020/09/7d667c687c1d52f43f91b01206fc4213_51936112556d8bcf41a0435afddcbd3f_compressed.png",
    "https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/05/479e87f126db06568ac29fe7d09aeea0_50a59249dddcad15ce07b346b905563f_compressed.png",
    "https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/05/fa02a36461e5a1524f88498ca58e683d_7856ad0c3410adae694bb99c8947f083_compressed.png",
    "https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2026/05/a3a3e5c42b67ada63245f132feff08db_122e1c0e7e75de88063a0e0ff5d63618_compressed.png",
    "https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2024/11/36cf17f0424b10f6dfc2df758d46c635_9cd5decd773df1d0ff1d143b717bc90a_compressed.png"
  ] },
  AKULAKU:     { name: 'Akulaku Paylater', enabled: ['akulaku'], feeType: 'MDR_NO_PPN', mdr: 0.015, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2022/07/dfd5c5f186c1f2cce991fedf9f52a917_8db643c45da1006bbad2212ddb4c8690_compressed.png"] },
  KREDIVO:     { name: 'Kredivo', enabled: ['kredivo'], feeType: 'MDR_NO_PPN', mdr: 0.015, iconUrls: ["https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads/2022/05/9a4f510f8455cc24c1434d990e2430c4_0fc1561096b3d8df5e17b2e9d0e0c784_compressed.png"] },
};

export function calculatePaymentFees(baseAmount: number, methodKey: PaymentMethodKey): { grossAmount: number, adminFee: number } {
  const method = PAYMENT_METHODS[methodKey];
  if (!method) return { grossAmount: baseAmount, adminFee: 0 };

  let fee = 0;
  
  if (method.feeType === 'FIXED' && method.fixedFee) {
    fee = method.fixedFee;
  } else if (method.feeType === 'MDR_PLUS_PPN' && method.mdr) {
    const mdrFee = baseAmount * method.mdr;
    const ppn = mdrFee * 0.11;
    fee = mdrFee + ppn;
  } else if (method.feeType === 'MDR_NO_PPN' && method.mdr) {
    fee = baseAmount * method.mdr;
  }

  const roundedFee = Math.ceil(fee);
  return {
    grossAmount: baseAmount + roundedFee,
    adminFee: roundedFee
  };
}
