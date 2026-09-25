/**
 * Load Razorpay Checkout.js once in the browser (SOU-15 test mode).
 */

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

type RazorpayConstructor = new (options: Record<string, unknown>) => {
  open: () => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let loading: Promise<RazorpayConstructor> | null = null;

export function loadRazorpay(): Promise<RazorpayConstructor> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay Checkout requires a browser'));
  }
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (loading) return loading;

  loading = new Promise<RazorpayConstructor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.Razorpay) resolve(window.Razorpay);
        else reject(new Error('Razorpay script loaded but constructor missing'));
      });
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay Checkout.js')));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error('Razorpay script loaded but constructor missing'));
    };
    script.onerror = () => {
      loading = null;
      reject(new Error('Failed to load Razorpay Checkout.js'));
    };
    document.body.appendChild(script);
  });

  return loading;
}

export type RazorpayCheckoutSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type OpenRazorpayCheckoutInput = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  prefill?: { email?: string; name?: string };
  notes?: Record<string, string>;
  handler: (response: RazorpayCheckoutSuccess) => void;
  ondismiss?: () => void;
};

export async function openRazorpayCheckout(input: OpenRazorpayCheckoutInput): Promise<void> {
  const Razorpay = await loadRazorpay();
  const rzp = new Razorpay({
    key: input.key,
    amount: input.amount,
    currency: input.currency,
    name: input.name ?? 'FilmyAI Staging',
    description: input.description ?? 'Test-mode checkout (SOU-15)',
    order_id: input.order_id,
    prefill: input.prefill ?? {},
    notes: input.notes ?? {},
    theme: { color: '#c9a227' },
    handler: input.handler,
    modal: {
      ondismiss: input.ondismiss,
    },
  });
  rzp.open();
}
