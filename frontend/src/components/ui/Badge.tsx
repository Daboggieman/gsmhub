import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded';

  const variants = {
    primary: 'bg-primary-container/15 text-primary',
    secondary: 'bg-secondary-container/15 text-secondary-container',
    success: 'bg-tertiary-container/30 text-tertiary',
    danger: 'bg-error-container/30 text-error',
    warning: 'bg-surface-container-high text-on-surface-variant',
    info: 'bg-secondary-container/15 text-secondary',
    outline: 'bg-transparent border border-outline-variant text-on-surface-variant',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 font-label-xs text-label-xs',
    sm: 'px-2 py-1 font-label-xs text-label-xs',
    md: 'px-2.5 py-1.5 font-label-sm text-label-sm',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
