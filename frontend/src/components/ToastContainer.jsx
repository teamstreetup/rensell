import { useToast } from '../hooks/useToast';

const TOAST_STYLES = {
  success: { bg: 'text-bg-success', icon: 'bi-check-circle-fill' },
  error: { bg: 'text-bg-danger', icon: 'bi-exclamation-triangle-fill' },
  warning: { bg: 'text-bg-warning', icon: 'bi-exclamation-circle-fill' },
  info: { bg: 'text-bg-primary', icon: 'bi-info-circle-fill' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1090, marginTop: '4.25rem' }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        return (
          <div
            key={toast.id}
            className={`toast show align-items-center ${style.bg} border-0 shadow-lg rounded-3 mb-2`}
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="toast-body d-flex align-items-center gap-2 fw-semibold small">
                <i className={`bi ${style.icon} fs-6`} />
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => removeToast(toast.id)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
