import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ImageSourcePropType,
  ImageStyle,
} from 'react-native';
import { useColors, useTypography } from '../theme/ThemeProvider';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  size?: AvatarSize;
  source?: ImageSourcePropType;
  name?: string;
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Avatar({
  size = 'md',
  source,
  name,
  imageStyle,
  containerStyle,
}: AvatarProps) {
  const colors = useColors();
  const { sizes } = useTypography();

  const getSizeStyles = () => {
    const sizeMap = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56,
    };

    const fontSize = {
      xs: sizes.xs,
      sm: sizes.sm,
      md: sizes.base,
      lg: sizes.lg,
      xl: sizes.xl,
    };

    return {
      width: sizeMap[size],
      height: sizeMap[size],
      borderRadius: sizeMap[size] / 2,
      fontSize: fontSize[size],
    };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const { width, height, borderRadius, fontSize } = getSizeStyles();

  if (source) {
    return (
      <Image
        source={source}
        style={[
          styles.image,
          {
            width,
            height,
            borderRadius,
          },
          imageStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.primary[100],
        },
        containerStyle,
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize,
            color: colors.primary[700],
          },
        ]}
      >
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    fontWeight: '600',
  },
}); 