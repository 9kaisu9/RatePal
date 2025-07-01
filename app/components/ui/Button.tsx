import { Text, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { ReactNode } from 'react';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

export interface ButtonProps {
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Button({ onPress, variant = 'primary', children, className = '', disabled = false }: ButtonProps) {
  const baseStyle = 'px-6 py-3 rounded-lg';
  const variants = {
    primary: disabled ? 'bg-blue-600/50' : 'bg-blue-600 active:opacity-80',
    secondary: disabled ? 'bg-gray-600/50' : 'bg-gray-600 active:opacity-80',
    outline: disabled ? 'border border-gray-500/50' : 'border border-gray-300 active:opacity-80',
  };

  return (
    <StyledPressable
      onPress={disabled ? undefined : onPress}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {typeof children === 'string' ? (
        <StyledText
          className={`text-center font-semibold ${
            variant === 'outline' 
              ? (disabled ? 'text-gray-500' : 'text-gray-300')
              : (disabled ? 'text-white/70' : 'text-white')
          }`}
        >
          {children}
        </StyledText>
      ) : (
        children
      )}
    </StyledPressable>
  );
}
