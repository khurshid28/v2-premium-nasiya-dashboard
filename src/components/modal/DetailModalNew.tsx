import React from "react";

export type DetailModalProps = {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

const DetailModal = ({ title, isOpen, onClose, children }: DetailModalProps): JSX.Element | null => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 pt-[220px] pb-10 md:pt-[320px]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-w-3xl w-full max-h-[65vh] bg-white dark:bg-navy-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title ?? "Details"}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded px-2 py-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6 text-sm text-gray-800 dark:text-gray-300 overflow-y-auto flex-1">{children}</div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="rounded bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-300"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
