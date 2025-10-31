import React from "react";

export type ToastProps = {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // ms
  type?: 'success' | 'error' | 'info' | 'warning';
};

const Toast = ({ message, isOpen, onClose, duration = 3000, type = 'info' }: ToastProps): JSX.Element | null => {
  React.useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          button: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
          icon: (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          button: 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
          icon: (
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          button: 'text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300',
          icon: (
            <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      default: // info
        return {
          container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          button: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
          icon: (
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`max-w-sm w-full shadow-lg rounded-lg border px-4 py-3 flex items-center gap-3 animate-in slide-in-from-right-full duration-300 ${styles.container}`}>
        {styles.icon}
        <div className={`text-sm font-medium flex-1 ${styles.text}`}>{message}</div>
        <button 
          onClick={onClose} 
          className={`text-xl leading-none ${styles.button} hover:scale-110 transition-transform`}
          aria-label="Yopish"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
