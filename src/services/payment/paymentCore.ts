import { PaymentData } from './types';

export const getLeaseWithPayments = async (leaseId: string) => {
  try {
    const response = await fetch(`/api/leases/${leaseId}/payments`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: 'Failed to fetch lease payments' };
  }
};

export const getPaymentsByLeaseId = async (leaseId: string) => {
  try {
    const response = await fetch(`/api/leases/${leaseId}/payments`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: 'Failed to fetch payments' };
  }
};

export const createPayment = async (paymentData: PaymentData) => {
  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: 'Failed to create payment' };
  }
};

export const updatePayment = async (paymentId: string, paymentData: PaymentData) => {
  try {
    const response = await fetch(`/api/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: 'Failed to update payment' };
  }
};

export const deletePayment = async (paymentId: string) => {
  try {
    const response = await fetch(`/api/payments/${paymentId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: 'Failed to delete payment' };
  }
};
