import React from 'react';
import { useToastStore, Toast as ToastType } from '../../store/useToastStore';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import './Toast.scss';

const ToastMessage: React.FC<{ toast: ToastType; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  return (
    <div className={`toast-message toast-message--${toast.type}`}>
      <div className="toast-message__icon">
        {toast.type === 'success' && <CheckCircle2 size={22} />}
        {toast.type === 'error' && <XCircle size={22} />}
        {toast.type === 'info' && <Info size={22} />}
      </div>
      <div className="toast-message__content">{toast.message}</div>
      <button className="toast-message__close" onClick={() => onClose(toast.id)}>
        <X size={18} />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
