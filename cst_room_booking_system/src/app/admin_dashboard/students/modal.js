// src/app/components/Modal.js
"use client";

export default function Modal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description,
  confirmText = "Save Changes",
  cancelText = "Cancel",
  children,
  showFooter = true,
  size = "md" 
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90%]"
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto shadow-xl`}>
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="flex gap-3 justify-end p-6 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-cstcolor text-white rounded-lg font-medium hover:bg-cstcolor2 transition-colors cursor-pointer"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}