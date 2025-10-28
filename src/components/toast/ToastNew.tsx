import React from "react";

export type ToastProps = {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // ms
};

const Toast = ({ message, isOpen, onClose, duration = 3000 }: ToastProps): JSX.Element | null => {
  React.useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="max-w-xs w-full bg-white shadow-lg rounded-md border px-4 py-2 flex items-center gap-3">
        <div className="text-sm text-gray-800">{message}</div>
        <button onClick={onClose} className="ml-2 text-xs text-gray-500 hover:text-gray-700">Close</button>
      </div>
    </div>
  );
};

export default Toast;
