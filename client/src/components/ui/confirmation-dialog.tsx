import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}) => {
  console.log('=== CONFIRMATION DIALOG DEBUG ===');
  console.log('isOpen:', isOpen);
  console.log('title:', title);
  console.log('description:', description);
  
  // Add a test div to see if the component is rendering
  if (isOpen) {
    console.log('Dialog should be visible - adding test div');
  }
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'white', color: '#374151' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 rounded-md font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#dc2626', color: 'white', borderColor: '#dc2626' }}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}; 