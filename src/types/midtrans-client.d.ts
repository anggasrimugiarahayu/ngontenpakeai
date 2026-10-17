declare module "midtrans-client" {
  export class Snap {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    createTransaction(parameter: Record<string, any>): Promise<{ token: string; redirect_url: string }>;
    transaction: Record<string, any>;
  }
  export class CoreApi {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    transaction: Record<string, any>;
  }
  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };
  export default midtransClient;
}
