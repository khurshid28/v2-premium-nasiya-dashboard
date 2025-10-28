import React from "react";

export type ToastType = "main" | "success" | "error";

export type ToastProps = {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // ms
  type?: ToastType;
};

const Toast = ({ message, isOpen, onClose, duration = 3000, type = "main" }: ToastProps): JSX.Element | null => {
  React.useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const variant = {
    main: "bg-white text-gray-800 border-gray-200",
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
  }[type || "main"];

  const icon = {
    main: "",
    success: "",
    error: "",
  }[type || "main"];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`max-w-xs w-full shadow-lg rounded-md border px-4 py-2 flex items-start gap-3 ${variant}`}>
        {icon ? <div className="mt-0.5 text-sm">{icon}</div> : null}
        <div className="text-sm whitespace-pre-line">{message}</div>
        <button onClick={onClose} className="ml-2 text-xs text-gray-500 hover:text-gray-700">Close</button>
      </div>
    </div>
  );
};

export default Toast;
