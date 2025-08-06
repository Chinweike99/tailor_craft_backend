// declare module 'paystack' {
//   const Paystack: (secretKey: string) => {
//     transaction: {
//       initialize: (data: any) => Promise<any>;
//       verify: (reference: string) => Promise<any>;
//     };
//     transfer: {
//       create: (data: any) => Promise<any>;
//     };
//     transferrecipient: {
//       create: (data: any) => Promise<any>;
//     };
//   };

//   export default Paystack;
// }



// types/paystack.d.ts
// Create this file in your project root or types folder

export interface PaystackResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaystackTransactionData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string | null;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: any;
  log: any;
  fees: number;
  fees_split: any;
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
    account_name: string | null;
  };
  customer: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: any;
    risk_action: string;
    international_format_phone: string | null;
  };
  plan: any;
  split: any;
  order_id: any;
  paidAt: string;
  createdAt: string;
  requested_amount: number;
  pos_transaction_data: any;
  source: any;
  fees_breakdown: any;
}

export interface PaystackInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackTransferRecipientData {
  active: boolean;
  createdAt: string;
  currency: string;
  domain: string;
  id: number;
  integration: number;
  name: string;
  recipient_code: string;
  type: string;
  updatedAt: string;
  is_deleted: boolean;
  details: {
    authorization_code: string | null;
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
  };
}

export interface PaystackTransferData {
  reference: string;
  integration: number;
  domain: string;
  amount: number;
  currency: string;
  source: string;
  reason: string;
  recipient: number;
  status: string;
  transfer_code: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}