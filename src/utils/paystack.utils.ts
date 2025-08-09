// utils/paystack.utils.ts
import axios, { AxiosResponse, AxiosError } from 'axios';
import config from '../config/config';
import { 
  PaystackResponse, 
  PaystackTransactionData, 
  PaystackInitializeResponse,
  PaystackTransferRecipientData,
  PaystackTransferData,
  // PaystackChargeResponse
} from '../types/paystack';

// Add these interfaces to your types/paystack.ts
interface PaystackChargeData {
  email: string;
  amount: number;
  card: {
    number: string;
    cvv: string;
    expiry_month: string;
    expiry_year: string;
  };
  reference?: string;
  metadata?: any;
}

interface PaystackChargeResponse {
  reference: string;
  status: string;
  gateway_response: string;
  amount: number;
  authorization_url?: string;
  display_text?: string;
}

class PaystackService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${config.paystack.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Handle Paystack API errors
  private handleError(error: AxiosError): never {
    if (error.response) {
      const errorMessage = error.response.data || 'Paystack API error';
      throw new Error(`Paystack Error: ${JSON.stringify(errorMessage)}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to reach Paystack');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }

  // Direct card charge for testing
  async chargeCard(data: PaystackChargeData): Promise<PaystackChargeResponse> {
    try {
      const response: AxiosResponse<PaystackResponse<PaystackChargeResponse>> = 
        await this.api.post('/charge', data);
      
      console.log('Charge response:', JSON.stringify(response.data, null, 2));
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Card charge failed');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Charge error:', error);
      this.handleError(error as AxiosError);
    }
  }

  // Submit PIN for charges that require it
  async submitPin(reference: string, pin: string): Promise<PaystackChargeResponse> {
    try {
      const response: AxiosResponse<PaystackResponse<PaystackChargeResponse>> = 
        await this.api.post('/charge/submit_pin', {
          reference,
          pin
        });
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'PIN submission failed');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Submit OTP for charges that require it
  async submitOtp(reference: string, otp: string): Promise<PaystackChargeResponse> {
    try {
      const response: AxiosResponse<PaystackResponse<PaystackChargeResponse>> = 
        await this.api.post('/charge/submit_otp', {
          reference,
          otp
        });
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'OTP submission failed');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Initialize transaction (existing method)
  async initializeTransaction(data: {
    email: string;
    amount: number;
    reference: string;
    callback_url?: string;
    metadata?: any;
    name?: string;
  }): Promise<PaystackInitializeResponse> {
    try {
      const response: AxiosResponse<PaystackResponse<PaystackInitializeResponse>> = 
        await this.api.post('/transaction/initialize', data);
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Transaction initialization failed');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Verify transaction (existing method)
  async verifyTransaction(reference: string): Promise<PaystackTransactionData> {
    try {
      const response: AxiosResponse<PaystackResponse<PaystackTransactionData>> = 
        await this.api.get(`/transaction/verify/${reference}`);
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Transaction verification failed');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Create transfer recipient (existing method)
  async createTransferRecipient(data: {
    type: string;
    name: string;
    account_number: string;
    bank_code: string;
    currency: string;
  }): Promise<PaystackTransferRecipientData> {
    try {
      const response: AxiosResponse<PaystackResponse<PaystackTransferRecipientData>> = 
        await this.api.post('/transferrecipient', data);
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to create transfer recipient');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Create transfer (existing method)
  async createTransfer(data: {
    source: string;
    amount: number;
    recipient: string;
    reason: string;
    reference: string;
  }): Promise<PaystackTransferData> {
    try {
      const response: AxiosResponse<PaystackResponse<PaystackTransferData>> = 
        await this.api.post('/transfer', data);
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Transfer failed');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // List banks (existing method)
  async listBanks(): Promise<any[]> {
    try {
      const response: AxiosResponse<PaystackResponse<any[]>> = 
        await this.api.get('/bank');
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to fetch banks');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Resolve bank account (existing method)
  async resolveAccountNumber(accountNumber: string, bankCode: string): Promise<{
    account_number: string;
    account_name: string;
    bank_id: number;
  }> {
    try {
      const response: AxiosResponse<PaystackResponse<any>> = 
        await this.api.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to resolve account');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }
}

export default new PaystackService();