// components/ConfirmationModal.js
"use client";

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
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm} 
              className={`px-4 py-2 ${getButtonColor()} text-white rounded-lg font-medium transition-colors cursor-pointer`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}