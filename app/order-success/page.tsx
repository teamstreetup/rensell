import OrderSuccessClient from '@/components/OrderSuccessClient';

interface OrderSuccessPageProps {
  searchParams: {
    orderId?: string;
    razorpayPaymentId?: string;
    razorpay_payment_id?: string;
    payment_id?: string;
  };
}

export const dynamic = 'force-dynamic';

export default function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const prefilledPaymentId =
    searchParams.razorpay_payment_id ||
    searchParams.razorpayPaymentId ||
    searchParams.payment_id;

  return (
    <OrderSuccessClient
      orderId={searchParams.orderId}
      prefilledPaymentId={prefilledPaymentId}
    />
  );
}
