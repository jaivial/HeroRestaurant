import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

export type TextVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption'
  | 'caption1'
  | 'caption2';

export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'blue' | 'green' | 'red' | 'orange';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  color?: TextColor;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  as?: React.ElementType;
  truncate?: boolean;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

/**
 * Layer 3: UI Component - Text
 * Implements Apple's semantic type hierarchy.
 */
export const Text = memo(function Text({
  variant = 'body',
  color = 'primary',
  weight,
  as,
  truncate = false,
  align,
  children,
  className = '',
  style,
  ...props
}: TextProps) {
  const theme = useAtomValue(themeAtom);

  const defaultElement: Record<TextVariant, React.ElementType> = {
    largeTitle: 'h1',
    title1: 'h1',
    title2: 'h2',
    title3: 'h3',
    headline: 'h4',
    body: 'p',
    callout: 'p',
    subheadline: 'h5',
    footnote: 'p',
    caption: 'span',
    caption1: 'span',
    caption2: 'span',
  };

  const Component = as || defaultElement[variant];

  // Apple SF Pro typography scale (styling.md)
  const variantClasses: Record<TextVariant, string> = {
    largeTitle: 'text-[34px] leading-tight',
    title1: 'text-[28px] leading-snug',
    title2: 'text-[22px] leading-normal',
    title3: 'text-[20px] leading-normal',
    headline: 'text-[17px] font-semibold leading-relaxed',
    body: 'text-[17px] leading-relaxed',
    callout: 'text-[16px] leading-tight',
    subheadline: 'text-[15px] leading-normal',
    footnote: 'text-[13px] leading-normal',
    caption: 'text-[12px] leading-tight',
    caption1: 'text-[12px] leading-tight',
    caption2: 'text-[11px] leading-tight',
  };

  const weightClasses = {
    regular: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const defaultWeights: Record<TextVariant, string> = {
    largeTitle: 'font-bold',
    title1: 'font-semibold',
    title2: 'font-semibold',
    title3: 'font-semibold',
    headline: 'font-semibold',
    body: 'font-normal',
    callout: 'font-semibold',
    subheadline: 'font-normal',
    footnote: 'font-normal',
    caption: 'font-normal',
    caption1: 'font-normal',
    caption2: 'font-medium',
  };

  const colorClasses: Record<TextColor, string> = {
    primary: theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]',
    secondary: theme === 'dark' ? 'text-white/60' : 'text-black/70',
    tertiary: theme === 'dark' ? 'text-white/45' : 'text-black/55',
    quaternary: theme === 'dark' ? 'text-white/30' : 'text-black/35',
    blue: theme === 'dark' ? 'text-[#0A84FF]' : 'text-[#007AFF]',
    green: theme === 'dark' ? 'text-[#30D158]' : 'text-[#34C759]',
    red: theme === 'dark' ? 'text-[#FF453A]' : 'text-[#FF3B30]',
    orange: theme === 'dark' ? 'text-[#FF9F0A]' : 'text-[#FF9500]',
  };

  return (
    <Component
      style={style}
      className={cn(
        variantClasses[variant],
        weight ? weightClasses[weight] : defaultWeights[variant],
        colorClasses[color],
        align && `text-${align}`,
        truncate && 'truncate',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

/* =============================================================================
   Convenience Components
   ============================================================================= */

interface HeadingProps extends Omit<TextProps, 'variant' | 'as'> {
  level?: 1 | 2 | 3;
}

export const Heading = memo(function Heading({ level = 1, ...props }: HeadingProps) {
  const variants: Record<number, TextVariant> = {
    1: 'title1',
    2: 'title2',
    3: 'title3',
  };
  const elements: Record<number, React.ElementType> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
  };

  return <Text variant={variants[level]} as={elements[level]} {...props} />;
});

interface LabelProps extends Omit<TextProps, 'variant' | 'as'> {
  htmlFor?: string;
}

export const Label = memo(function Label({ className = '', ...props }: LabelProps) {
  return (
    <Text
      variant="callout"
      as="label"
      weight="semibold"
      className={cn('block mb-2', className)}
      {...props}
    />
  );
});
