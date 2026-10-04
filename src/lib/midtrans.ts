import midtransClient from 'midtrans-client';

const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || '';

// Force production mode if the key doesn't start with 'SB-'
const isProduction = serverKey.startsWith('Mid-server-') ? true : process.env.NODE_ENV === 'production';

export const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey
});

export const coreApi = new midtransClient.CoreApi({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey
});
