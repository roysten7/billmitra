import React from 'react';

interface CustomSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  id,
}) => {
  return (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}
      `}
      style={{
        border: 'none',
        outline: 'none',
        padding: 0,
        margin: 0,
        background: checked ? '#2563eb' : '#d1d5db',
      }}
    >
      <span
        className={`
          inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(2px)',
          transition: 'transform 0.2s ease-in-out',
          border: '1px solid #e5e7eb',
        }}
      />
    </button>
  );
}; 