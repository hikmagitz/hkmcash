import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'danger' | 'success';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'primary',
  onClick,
  className = '',
  disabled = false,
  size = 'md',
  loading = false,
}) => {
  const baseClasses = 'relative overflow-hidden font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-lg shadow-sm hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-sm';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-sm md:text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]',
  };
  
  const typeClasses = {
    primary: 'bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-sky-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600 dark:hover:border-gray-500 focus:ring-gray-500/30',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity',
  };
  
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed transform-none hover:shadow-sm' : 'cursor-pointer hover:scale-105';

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      // Add haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      onClick();
    }
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${typeClasses[type]} ${disabledClasses} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={`relative z-10 flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
    </button>
  );
};

export default Button;