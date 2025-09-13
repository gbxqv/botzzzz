import axios from 'axios';

export class PushinpayApiService {
  constructor() {
    this.baseUrl = 'https://api.pushinpay.com.br';
    this.token = process.env.PUSHINPAY_TOKEN;
    
    // Debug token loading
    if (!this.token) {
      console.error('❌ PUSHINPAY_TOKEN não encontrado nas variáveis de ambiente');
      console.error('🔍 Variáveis disponíveis:', Object.keys(process.env).filter(key => key.includes('PUSH')));
    } else {
      console.log('✅ Token Pushi-In Pay carregado:', this.token.substring(0, 10) + '...');
    }
  }

  // Generate webhook URL for different hosting platforms
  getWebhookUrl(req = null) {
    // For SquareCloud
    if (process.env.SQUARECLOUD_URL) {
      return `${process.env.SQUARECLOUD_URL}/webhook/pushinpay`;
    }
    
    // For Replit
    if (process.env.REPLIT_DOMAINS) {
      return `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/webhook/pushinpay`;
    }
    
    // Manual webhook URL
    if (process.env.PAYMENT_WEBHOOK_URL) {
      return process.env.PAYMENT_WEBHOOK_URL;
    }
    
    // Fallback - try to build from request
    if (req) {
      return `${req.protocol}://${req.get('host')}/webhook/pushinpay`;
    }
    
    return 'https://your-domain.com/webhook/pushinpay';
  }

  async createPixPayment(customerData, req = null) {
    try {
      console.log('📋 Sending payment data to Pushi-In Pay:', JSON.stringify(customerData, null, 2));
      
      const webhookUrl = this.getWebhookUrl(req);
      console.log('🔗 Using webhook URL:', webhookUrl);
      
      const requestBody = {
        value: Math.max(50, customerData.amount), // Ensure minimum value of 50 cents (R$ 0.50)
        webhook_url: webhookUrl,
        split_rules: []
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const headers = {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      console.log('🔑 Authorization header:', `Bearer ${this.token ? this.token.substring(0, 10) + '...' : 'TOKEN_MISSING'}`);
      
      const response = await axios.post(`${this.baseUrl}/api/pix/cashIn`, requestBody, {
        headers
      });

      console.log('✅ Pushi-In Pay response:', JSON.stringify(response.data, null, 2));

      // Map Pushi-In Pay response to expected format
      return {
        id: response.data.id,
        pixQrCode: response.data.qr_code_base64 || '',
        pixCode: response.data.qr_code || '',
        amount: response.data.value, // Keep the original value from API response
        expiresAt: null, // Pushi-In Pay doesn't provide expiration in the response
        status: response.data.status || 'created'
      };
    } catch (error) {
      console.error('❌ Pushi-In Pay API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data?.errors) {
        console.error('❌ Validation Errors:', error.response.data.errors);
      }
      
      throw new Error(error.response?.data?.message || 'Erro interno ao processar pagamento');
    }
  }

  validateWebhook(payload) {
    try {
      console.log('🔍 Validating webhook payload:', JSON.stringify(payload, null, 2));
      
      // Validate Pushi-In Pay webhook payload structure
      if (!payload.id || !payload.status) {
        console.error('❌ Missing required fields: id or status');
        console.error('❌ Received payload:', payload);
        return null;
      }
      
      // Value can be string or number
      const amount = typeof payload.value === 'string' ? parseInt(payload.value) : payload.value;
      if (isNaN(amount)) {
        console.error('❌ Invalid value field:', payload.value);
        return null;
      }
      
      const validated = {
        id: payload.id,
        status: payload.status,
        amount: amount, // Ensure it's a number
        method: 'PIX',
        approvedAt: payload.updated_at || payload.paid_at,
        refundedAt: payload.refunded_at,
        chargebackAt: payload.chargeback_at,
        endToEndId: payload.end_to_end_id,
        payerName: payload.payer_name,
        payerDocument: payload.payer_national_registration
      };
      
      console.log('✅ Webhook validation successful:', validated);
      return validated;
    } catch (error) {
      console.error('❌ Error validating webhook:', error);
      console.error('❌ Payload that failed validation:', payload);
      return null;
    }
  }
}
