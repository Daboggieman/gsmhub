import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200',
    outline: 'border-2 border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200',
    success: 'bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
