import type { HTMLAttributes, ElementType } from 'react';
import { cn } from '../../../utils/cn';

type TextVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption1'
  | 'caption2';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'blue' | 'green' | 'red' | 'orange';

interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  color?: TextColor;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  as?: ElementType;
  truncate?: boolean;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function Text({
  variant = 'body',
  color = 'primary',
  weight,
  as,
  truncate = false,
  align,
  children,
  className,
  ...props
}: TextProps) {
  // Default element based on variant
  const defaultElement: Record<TextVariant, ElementType> = {
    largeTitle: 'h1',
    title1: 'h1',
    title2: 'h2',
    title3: 'h3',
    headline: 'h4',
    body: 'p',
    callout: 'p',
    subheadline: 'h5',
    footnote: 'p',
    caption1: 'span',
    caption2: 'span',
  };

  const Component = as || defaultElement[variant];

  // Apple SF Pro typography scale
  const variantClasses: Record<TextVariant, string> = {
    largeTitle: 'text-4xl leading-tight tracking-tight',
    title1: 'text-3xl leading-tight tracking-tight',
    title2: 'text-2xl leading-snug tracking-tight',
    title3: 'text-xl leading-snug tracking-tight',
    headline: 'text-lg font-semibold leading-normal',
    body: 'text-base leading-relaxed',
    callout: 'text-md leading-relaxed',
    subheadline: 'text-sm leading-normal',
    footnote: 'text-sm leading-normal',
    caption1: 'text-xs leading-tight',
    caption2: 'text-xs leading-tight',
  };

  // Default weights for each variant
  const defaultWeights: Record<TextVariant, string> = {
    largeTitle: 'font-bold',
    title1: 'font-bold',
    title2: 'font-semibold',
    title3: 'font-semibold',
    headline: 'font-semibold',
    body: 'font-normal',
    callout: 'font-normal',
    subheadline: 'font-medium',
    footnote: 'font-normal',
    caption1: 'font-normal',
    caption2: 'font-medium',
  };

  const weightClasses: Record<string, string> = {
    regular: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses: Record<TextColor, string> = {
    primary: 'text-content-primary',
    secondary: 'text-content-secondary',
    tertiary: 'text-content-tertiary',
    quaternary: 'text-content-quaternary',
    blue: 'text-apple-blue',
    green: 'text-apple-green',
    red: 'text-apple-red',
    orange: 'text-apple-orange',
  };

  const alignClasses: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <Component
      className={cn(
        variantClasses[variant],
        weight ? weightClasses[weight] : defaultWeights[variant],
        colorClasses[color],
        align && alignClasses[align],
        truncate && 'truncate',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/* =============================================================================
   Convenience Components
   ============================================================================= */

export function Heading({
  level = 1,
  ...props
}: Omit<TextProps, 'variant' | 'as'> & { level?: 1 | 2 | 3 }) {
  const variants: Record<number, TextVariant> = {
    1: 'title1',
    2: 'title2',
    3: 'title3',
  };
  const elements: Record<number, ElementType> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
  };

  return <Text variant={variants[level]} as={elements[level]} {...props} />;
}

export function Label({ className, ...props }: Omit<TextProps, 'variant' | 'as'>) {
  return (
    <Text
      variant="subheadline"
      as="label"
      color="secondary"
      className={cn('block mb-1.5', className)}
      {...props}
    />
  );
}
