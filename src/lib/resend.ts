interface CartItemPayload {
  title: string;
  quantity: number;
  price: number;
  image?: string;
  variant?: string;
}

interface OrderEmailPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  upazila: string;
  district: string;
  cart: CartItemPayload[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: string;
  notes?: string;
}

/**
 * Send order-confirmation emails (admin + customer) via the server-side
 * /api/send-order-email relay. The Resend API key lives only on the server —
 * this function never touches it.
 */
export async function sendOrderEmailsViaResend(payload: OrderEmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const r = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (d.success) {
      console.log('✅ Order email sent successfully:', d.id);
      return { success: true };
    }
    console.error('❌ Order email failed:', d.error);
    return { success: false, error: d.error || 'Order email relay error' };
  } catch (error: any) {
    console.error('❌ Order email fetch error:', error);
    return { success: false, error: error?.message || 'Network error' };
  }
}
