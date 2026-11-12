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
  const baseStyles = 'inline-flex items-center justify-center rounded font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-primary-container hover:bg-inverse-primary text-on-primary-container font-bold shadow-md',
    secondary: 'bg-surface-container hover:bg-surface-container-high text-on-surface',
    outline: 'border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container',
    ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
    danger: 'bg-error text-on-error hover:brightness-110 font-bold',
    success: 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary font-bold',
  };

  const sizes = {
    sm: 'px-3 py-1.5 font-label-sm text-label-sm',
    md: 'px-space-md py-2.5 font-label-md text-label-md',
    lg: 'px-space-xl py-3 font-label-md text-label-md',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          className="material-symbols-outlined text-[18px] mr-2 animate-spin"
          aria-hidden="true"
        >
          progress_activity
        </span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
