import { TextInput, View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledTextInput = styled(TextInput);
const StyledView = styled(View);
const StyledText = styled(Text);

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  className?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  required?: boolean;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  className = '',
  keyboardType = 'default',
  required = false,
}: InputProps) {
  return (
    <StyledView className={`mb-4 ${className}`}>
      {label && (
        <StyledText className="text-gray-300 mb-2 text-sm">
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </StyledText>
      )}
      <StyledTextInput
        className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700"
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </StyledView>
  );
}
