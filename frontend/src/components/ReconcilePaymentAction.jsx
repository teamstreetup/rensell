import { useState } from 'react';
import { paymentAPI, extractApiError } from '../services/api';

export default function ReconcilePaymentAction({
  orderId,
  paymentMethod,
  paymentStatus,
  razorpayPaymentId = '',
  onSuccess,
}) {
  const [manualPaymentId, setManualPaymentId] = useState(razorpayPaymentId || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  if (paymentMethod !== 'razorpay' || paymentStatus === 'paid') {
    return null;
  }

  const handleReconcile = async () => {
    const trimmedId = manualPaymentId.trim();
    if (!trimmedId) {
      setIsError(true);
      setMessage('Enter a Razorpay Payment ID first.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setIsError(false);

      await paymentAPI.reconcile({
        orderId,
        razorpayPaymentId: trimmedId,
      });

      setIsError(false);
      setMessage('Payment reconciled successfully. Refreshing order...');
      onSuccess?.();
    } catch (error) {
      setIsError(true);
      setMessage(extractApiError(error, 'Failed to reconcile payment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alert alert-warning rounded-3 mt-3 mb-0 p-3">
      <div className="small fw-semibold mb-2">
        <i className="bi bi-exclamation-circle me-1" />
        Payment appears incomplete. Enter your Razorpay Payment ID to reconcile if funds were captured.
      </div>
      <div className="input-group input-group-sm">
        <input
          type="text"
          value={manualPaymentId}
          onChange={(e) => setManualPaymentId(e.target.value)}
          placeholder="Razorpay Payment ID (e.g. pay_xxx)"
          className="form-control bg-white"
        />
        <button type="button" onClick={handleReconcile} disabled={loading} className="btn btn-rensell btn-sm">
          {loading ? 'Reconciling...' : 'Reconcile Payment'}
        </button>
      </div>
      {message && (
        <div className={`small fw-semibold mt-2 ${isError ? 'text-danger' : 'text-success'}`}>{message}</div>
      )}
    </div>
  );
}
