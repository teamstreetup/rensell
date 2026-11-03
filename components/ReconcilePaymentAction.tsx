'use client';

import { useState } from 'react';

type ReconcilePaymentActionProps = {
    orderId: string;
    paymentMethod: string;
    paymentStatus: string;
    razorpayPaymentId?: string;
    onSuccess?: () => void;
};

export default function ReconcilePaymentAction({
    orderId,
    paymentMethod,
    paymentStatus,
    razorpayPaymentId,
    onSuccess,
}: ReconcilePaymentActionProps) {
    const [manualPaymentId, setManualPaymentId] = useState(razorpayPaymentId || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

    if (paymentMethod !== 'razorpay' || paymentStatus === 'paid') {
        return null;
    }

    const handleReconcile = async () => {
        const paymentId = manualPaymentId.trim();

        if (!paymentId) {
            setIsError(true);
            setMessage('Enter Razorpay payment ID first.');
            return;
        }

        try {
            setLoading(true);
            setMessage(null);
            setIsError(false);

            const token = localStorage.getItem('token');
            const res = await fetch('/api/payment/reconcile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderId,
                    razorpayPaymentId: paymentId,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to reconcile payment');
            }

            setIsError(false);
            setMessage('Payment reconciled successfully. Refreshing order...');
            onSuccess?.();
        } catch (error: any) {
            setIsError(true);
            setMessage(error?.message || 'Failed to reconcile payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50">
            <div className="text-xs font-semibold text-amber-900 mb-2">
                Payment appears incomplete. You can reconcile it if Razorpay already captured funds.
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={manualPaymentId}
                    onChange={(e) => setManualPaymentId(e.target.value)}
                    placeholder="Razorpay Payment ID (e.g. pay_xxx)"
                    className="flex-1 px-3 py-2 text-sm border border-amber-300 rounded-md bg-white"
                />
                <button
                    onClick={handleReconcile}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-semibold rounded-md bg-primary text-white hover:bg-accent disabled:opacity-60"
                >
                    {loading ? 'Reconciling...' : 'Reconcile Payment'}
                </button>
            </div>
            {message && (
                <div className={`mt-2 text-xs ${isError ? 'text-red-600' : 'text-green-700'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}
