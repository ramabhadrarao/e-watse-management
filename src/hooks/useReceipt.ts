// src/hooks/useReceipt.ts
// Custom hook for receipt download functionality - Real backend API integration
// Used by order details page for PDF receipt generation and download

import { useMutation } from 'react-query';
import { orderService } from '../services/orderService';
import { useToast } from './useToast';

export const useDownloadReceipt = () => {
  const { showSuccess, showError } = useToast();

  return useMutation(
    (orderId: string) => orderService.generateOrderReceipt(orderId),
    {
      onSuccess: (data, orderId) => {
        // Create blob URL and trigger download
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${orderId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showSuccess('Receipt downloaded successfully');
      },
      onError: (error: any) => {
        console.error('Failed to download receipt:', error);
        showError(error.response?.data?.message || 'Failed to download receipt');
      }
    }
  );
};

// Additional utility hook for checking if receipt is available
export const useReceiptAvailable = (orderStatus: string) => {
  return orderStatus === 'completed';
};