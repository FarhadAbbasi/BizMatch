import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useColors, useTypography, useLayout } from '../theme/ThemeProvider';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerStyle,
      style,
      ...props
    },
    ref
  ) => {
    const colors = useColors();
    const { sizes } = useTypography();
    const { borderRadius } = useLayout();

    const inputStyles = [
      styles.input,
      {
        borderRadius: borderRadius.md,
        borderColor: error ? colors.accent.error : colors.semantic.border,
        fontSize: sizes.base,
        color: colors.text.primary,
        paddingLeft: leftIcon ? 44 : 16,
        paddingRight: rightIcon ? 44 : 16,
      },
      style,
    ];

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: error ? colors.accent.error : colors.text.primary,
                fontSize: sizes.sm,
              },
            ]}
          >
            {label}
          </Text>
        )}
        <View style={styles.inputContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.semantic.placeholder}
            style={inputStyles}
            {...props}
          />
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
        {(error || helperText) && (
          <Text
            style={[
              styles.helperText,
              {
                color: error ? colors.accent.error : colors.text.secondary,
                fontSize: sizes.sm,
              },
            ]}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  iconLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
  helperText: {
    marginTop: 6,
  },
}); 