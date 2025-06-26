import { Text, Pressable } from 'react-native';
import { styled } from 'nativewind';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

interface ButtonProps {
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  children: string;
  className?: string;
}

export function Button({ onPress, variant = 'primary', children, className = '' }: ButtonProps) {
  const baseStyle = 'px-6 py-3 rounded-lg active:opacity-80';
  const variants = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    outline: 'border border-gray-300',
  };

  return (
    <StyledPressable
      onPress={onPress}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      <StyledText
        className={`text-center font-semibold ${
          variant === 'outline' ? 'text-gray-300' : 'text-white'
        }`}
      >
        {children}
      </StyledText>
    </StyledPressable>
  );
}
