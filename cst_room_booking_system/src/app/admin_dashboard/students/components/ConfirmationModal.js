// components/ConfirmationModal.js
"use client";

import { useState, useEffect, useRef } from "react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  actionType = "default" // 'default', 'danger'
}) {
  const cancelRef  = useRef(null);
  const confirmRef = useRef(null);
  // 0 = Cancel, 1 = Confirm. Danger actions start on Cancel for safety.
  const [activeIndex, setActiveIndex] = useState(actionType === "danger" ? 0 : 1);

  // Reset the highlighted button every time the modal opens.
  useEffect(() => {
    if (isOpen) setActiveIndex(actionType === "danger" ? 0 : 1);
  }, [isOpen, actionType]);

  // Left/Right arrows move between the two buttons; Esc cancels.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); setActiveIndex(0); }
      else if (e.key === "ArrowRight") { e.preventDefault(); setActiveIndex(1); }
      else if (e.key === "Escape")     { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Keep real DOM focus on the highlighted button so Enter/Space activates it.
  useEffect(() => {
    if (!isOpen) return;
    const ref = activeIndex === 0 ? cancelRef : confirmRef;
    ref.current?.focus();
  }, [isOpen, activeIndex]);

  if (!isOpen) return null;

  const getHeaderColor = () => {
    if (actionType === 'danger') return 'bg-red-600';
    return 'bg-cstcolor';
  };

  const getButtonColor = () => {
    if (actionType === 'danger') return 'bg-red-600 hover:bg-red-700';
    return 'bg-cstcolor hover:bg-cstcolor3';
  };

  const getMessageColor = () => {
    if (actionType === 'danger') return 'text-red-800';
    return 'text-cstcolor2';
  };

  const getBorderColor = () => {
    if (actionType === 'danger') return 'border-red-200';
    return 'border-blue-200';
  };

  const getBgColor = () => {
    if (actionType === 'danger') return 'bg-red-50';
    return 'bg-blue-50';
  };

  return (
    <div className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header - changes color based on actionType */}
        <div className={`${getHeaderColor()} rounded-t-2xl px-6 py-4`}>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-white/80 text-sm mt-1">{message}</p>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className={`${getBgColor()} border ${getBorderColor()} rounded-lg p-4 mb-6`}>
            <p className={`text-sm ${getMessageColor()}`}>
              Are you sure you want to proceed?
            </p>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              ref={cancelRef}
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              {cancelText}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              className={`px-4 py-2 ${getButtonColor()} text-white rounded-lg font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${actionType === 'danger' ? 'focus:ring-red-500' : 'focus:ring-cstcolor'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}