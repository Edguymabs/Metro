import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex flex-col gap-2 p-4 rounded-lg border shadow-lg min-w-80 max-w-lg animate-slide-in ${getColorClasses(
            toast.type
          )}`}
        >
          <div className="flex items-start gap-3">
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.message}</p>
              {toast.details && (
                <div className="mt-2 text-xs opacity-90">
                  {Array.isArray(toast.details) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {toast.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words font-mono bg-black/10 p-2 rounded text-xs overflow-auto max-h-40">
                      {toast.details}
                    </pre>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current hover:opacity-75 transition-opacity flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;

