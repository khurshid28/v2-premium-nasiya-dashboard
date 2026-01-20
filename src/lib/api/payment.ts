import apiClient from './index';

export type PaymentProvider = 'PAYME' | 'CLICK' | 'UZUM' | 'APELSIN' | 'PLUM' | 'AUTO' | 'MIB' | 'CASH';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentType = 'INITIAL_PAYMENT' | 'MONTHLY_PAYMENT' | 'EARLY_PAYMENT' | 'PENALTY_PAYMENT' | 'OVERPAYMENT';

export interface Payment {
  id: number;
  amount: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  paymentType: PaymentType;
  transactionId?: string;
  checkNumber?: string;
  externalId?: string;
  receiptUrl?: string;
  monthNumber?: number;
  
  zayavka_id?: number;
  client_id?: number;
  merchant_id?: number;
  fillial_id?: number;
  
  paymentDate?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  description?: string;
  notes?: string;
  errorMessage?: string;
  metadata?: any;
  
  // Relations
  zayavka?: any;
  client?: any;
  merchant?: any;
  fillial?: any;
}

export interface CreatePaymentDto {
  amount: number;
  provider: PaymentProvider;
  paymentType?: PaymentType;
  transactionId?: string;
  checkNumber?: string;
  externalId?: string;
  receiptUrl?: string;
  monthNumber?: number;
  
  zayavka_id?: number;
  client_id?: number;
  merchant_id?: number;
  fillial_id?: number;
  
  paymentDate?: string;
  description?: string;
  notes?: string;
  metadata?: any;
}

export interface UpdatePaymentDto {
  amount?: number;
  provider?: PaymentProvider;
  status?: PaymentStatus;
  paymentType?: PaymentType;
  transactionId?: string;
  checkNumber?: string;
  externalId?: string;
  receiptUrl?: string;
  monthNumber?: number;
  
  paymentDate?: string;
  processedAt?: string;
  description?: string;
  notes?: string;
  errorMessage?: string;
  metadata?: any;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  provider?: PaymentProvider;
  zayavka_id?: number;
  client_id?: number;
  merchant_id?: number;
  fillial_id?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const paymentApi = {
  // Get all payments
  getPayments: (filters?: PaymentFilters) => {
    return apiClient.get<Payment[]>('/payment', { params: filters });
  },

  // Get payment by ID
  getPaymentById: (id: number) => {
    return apiClient.get<Payment>(`/payment/${id}`);
  },

  // Create new payment
  createPayment: (data: CreatePaymentDto) => {
    return apiClient.post<Payment>('/payment', data);
  },

  // Update payment
  updatePayment: (id: number, data: UpdatePaymentDto) => {
    return apiClient.patch<Payment>(`/payment/${id}`, data);
  },

  // Delete payment
  deletePayment: (id: number) => {
    return apiClient.delete(`/payment/${id}`);
  },

  // Process payment (mark as completed/failed)
  processPayment: (id: number, status: 'COMPLETED' | 'FAILED', errorMessage?: string) => {
    return apiClient.patch<Payment>(`/payment/${id}/process`, { status, errorMessage });
  },

  // Cancel payment
  cancelPayment: (id: number, reason?: string) => {
    return apiClient.patch<Payment>(`/payment/${id}/cancel`, { reason });
  },

  // Refund payment
  refundPayment: (id: number, reason?: string) => {
    return apiClient.patch<Payment>(`/payment/${id}/refund`, { reason });
  },

  // Get payment statistics
  getPaymentStats: (filters?: { startDate?: string; endDate?: string; merchant_id?: number; fillial_id?: number }) => {
    return apiClient.get('/payment/stats', { params: filters });
  },

  // Generate monthly payments for a zayavka
  generatePaymentsForZayavka: (zayavkaId: number) => {
    return apiClient.post(`/payment/generate/${zayavkaId}`);
  },

  // Generate payments for all zayavkas
  generatePaymentsForAll: () => {
    return apiClient.post('/payment/generate-all');
  },

  // Calculate debt for a zayavka
  calculateDebt: (zayavkaId: number) => {
    return apiClient.get(`/payment/debt/${zayavkaId}`);
  },

  // Get all debts
  getAllDebts: (filters?: { merchant_id?: number; fillial_id?: number; minDebt?: number }) => {
    return apiClient.get('/payment/debts', { params: filters });
  },
};
