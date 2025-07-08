import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
  View,
} from 'react-native';
import { useColors, useTypography, useLayout } from '../theme/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const colors = useColors();
  const { sizes } = useTypography();
  const { borderRadius } = useLayout();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.secondary[500],
          borderColor: colors.secondary[500],
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary[500],
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.primary[500],
          borderColor: colors.primary[500],
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: borderRadius.base,
          fontSize: sizes.sm,
        };
      case 'lg':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: borderRadius.lg,
          fontSize: sizes.lg,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: borderRadius.md,
          fontSize: sizes.base,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.text.disabled;
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary[500];
      default:
        return colors.text.inverse;
    }
  };

  const buttonStyles = [
    styles.button,
    getVariantStyles(),
    getSizeStyles(),
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    { fontSize: getSizeStyles().fontSize, color: getTextColor() },
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      {...props}
    >
      <View style={styles.content}>
        {leftIcon && !loading && <View style={styles.icon}>{leftIcon}</View>}
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text style={textStyles}>{children}</Text>
        )}
        {rightIcon && !loading && <View style={styles.icon}>{rightIcon}</View>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginHorizontal: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
}); 