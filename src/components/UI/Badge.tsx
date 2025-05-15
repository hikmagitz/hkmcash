import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  type?: 'income' | 'expense' | 'neutral';
  color?: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  type = 'neutral',
  color,
  className = '',
}) => {
  const typeClasses = {
    income: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    expense: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  const baseClasses = 'px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center';
  
  const customStyle = color ? { backgroundColor: `${color}20`, color: color } : {};

  return (
    <span 
      className={`${baseClasses} ${color ? '' : typeClasses[type]} ${className}`}
      style={customStyle}
    >
      {children}
    </span>
  );
};

export default Badge;