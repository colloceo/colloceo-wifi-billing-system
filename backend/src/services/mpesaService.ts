import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface STKPushRequest {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

class MpesaService {
  private baseURL: string;
  private consumerKey: string;
  private consumerSecret: string;
  private shortcode: string;
  private passkey: string;
  private callbackURL: string;

  constructor() {
    this.baseURL = process.env.MPESA_ENVIRONMENT === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    this.consumerKey = process.env.MPESA_CONSUMER_KEY!;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    this.shortcode = process.env.MPESA_SHORTCODE!;
    this.passkey = process.env.MPESA_PASSKEY!;
    this.callbackURL = process.env.MPESA_CALLBACK_URL!;
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    try {
      const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      
      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
    return password;
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    phone = phone.replace(/\D/g, '');
    
    // Handle Kenyan phone numbers
    if (phone.startsWith('0')) {
      phone = '254' + phone.slice(1);
    } else if (phone.startsWith('+254')) {
      phone = phone.slice(1);
    } else if (!phone.startsWith('254')) {
      phone = '254' + phone;
    }
    
    return phone;
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    const accessToken = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = this.generatePassword();
    const phone = this.formatPhoneNumber(request.phone);

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(request.amount),
      PartyA: phone,
      PartyB: this.shortcode,
      PhoneNumber: phone,
      CallBackURL: this.callbackURL,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('STK Push Error:', error.response?.data || error.message);
      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = this.generatePassword();

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('STK Query Error:', error.response?.data || error.message);
      throw new Error('Failed to query payment status');
    }
  }

  async handleCallback(callbackData: any): Promise<void> {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

      let mpesaReceiptNumber = null;
      let amount = null;
      let phone = null;

      if (ResultCode === 0 && stkCallback.CallbackMetadata) {
        const metadata = stkCallback.CallbackMetadata.Item;
        
        for (const item of metadata) {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value;
          } else if (item.Name === 'Amount') {
            amount = item.Value;
          } else if (item.Name === 'PhoneNumber') {
            phone = item.Value;
          }
        }
      }

      // Update payment status in database
      await prisma.payment.update({
        where: { checkoutRequestId: CheckoutRequestID },
        data: {
          status: ResultCode === 0 ? 'COMPLETED' : 'FAILED',
          mpesaReceiptNumber: mpesaReceiptNumber
        }
      });

      // If payment successful, create session
      if (ResultCode === 0) {
        const payment = await prisma.payment.findUnique({
          where: { checkoutRequestId: CheckoutRequestID },
          include: { user: true, plan: true }
        });

        if (payment) {
          // Create session for the user
          const sessionToken = this.generateSessionToken();
          const endTime = new Date();
          endTime.setHours(endTime.getHours() + payment.plan.duration);

          await prisma.session.create({
            data: {
              userId: payment.userId,
              planId: payment.planId,
              sessionToken,
              endTime,
              status: 'ACTIVE'
            }
          });
        }
      }
    } catch (error) {
      console.error('Callback handling error:', error);
    }
  }

  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export default new MpesaService();