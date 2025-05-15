import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'danger' | 'success';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'primary',
  onClick,
  className = '',
  disabled = false,
}) => {
  const baseClasses = 'px-3 py-2 md:px-4 md:py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base min-h-[36px] md:min-h-[44px]';
  
  const typeClasses = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      className={`${baseClasses} ${typeClasses[type]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;