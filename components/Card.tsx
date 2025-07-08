import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useColors, useLayout } from '../theme/ThemeProvider';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  onPress?: TouchableOpacityProps['onPress'];
  children: React.ReactNode;
}

export function Card({
  variant = 'elevated',
  onPress,
  children,
  style,
  ...props
}: CardProps) {
  const colors = useColors();
  const { borderRadius, shadows } = useLayout();

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.background.primary,
          borderWidth: 1,
          borderColor: colors.semantic.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.background.secondary,
        };
      default:
        return {
          backgroundColor: colors.background.primary,
          ...shadows.md,
        };
    }
  };

  const cardStyles = [
    styles.card,
    {
      borderRadius: borderRadius.lg,
    },
    getVariantStyles(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    width: '100%',
  },
}); 