import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { useColors, useTypography, useLayout } from '../theme/ThemeProvider';

export type BadgeVariant = 'solid' | 'outline' | 'subtle';
export type BadgeStatus = 'info' | 'success' | 'warning' | 'error';

export interface BadgeProps {
  variant?: BadgeVariant;
  status?: BadgeStatus;
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  variant = 'solid',
  status = 'info',
  label,
  containerStyle,
  textStyle,
}: BadgeProps) {
  const colors = useColors();
  const { sizes } = useTypography();
  const { borderRadius } = useLayout();

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return colors.accent.success;
      case 'warning':
        return colors.accent.warning;
      case 'error':
        return colors.accent.error;
      default:
        return colors.accent.info;
    }
  };

  const getVariantStyles = () => {
    const statusColor = getStatusColor();

    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: statusColor,
        };
      case 'subtle':
        return {
          backgroundColor: `${statusColor}20`, // 20% opacity
        };
      default:
        return {
          backgroundColor: statusColor,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'solid') {
      return colors.text.inverse;
    }
    return getStatusColor();
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: borderRadius.full,
        },
        getVariantStyles(),
        containerStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: sizes.xs,
            color: getTextColor(),
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
}); 