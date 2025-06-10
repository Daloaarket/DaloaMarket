import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const getButtonStyle = () => {
    const baseStyle = 'py-3 px-6 rounded-full flex-row justify-center items-center';
    
    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-primary ${disabled ? 'opacity-50' : ''}`;
      case 'secondary':
        return `${baseStyle} bg-secondary ${disabled ? 'opacity-50' : ''}`;
      case 'outline':
        return `${baseStyle} border-2 border-grey-300 ${disabled ? 'opacity-50' : ''}`;
      default:
        return `${baseStyle} bg-primary ${disabled ? 'opacity-50' : ''}`;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return 'text-white font-semibold text-base';
      case 'outline':
        return 'text-grey-700 font-semibold text-base';
      default:
        return 'text-white font-semibold text-base';
    }
  };

  return (
    <TouchableOpacity
      className={`${getButtonStyle()} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small\" color={variant === 'outline' ? '#374151' : '#FFFFFF'} />
      ) : (
        <Text className={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;