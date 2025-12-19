import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'solid';
  children: ReactNode;
  className?: string;
}

export function Card({
  variant = 'default',
  children,
  className = '',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'glass',
    subtle: 'glass-subtle',
    solid: 'glass-solid',
  };

  return (
    <div
      className={`${variantStyles[variant]} rounded-lg p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
