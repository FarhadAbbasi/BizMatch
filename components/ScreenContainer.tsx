import React from 'react';
import { View, ScrollView, StyleSheet, Platform, RefreshControl, RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: any;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function ScreenContainer({ 
  children, 
  scrollable = true, 
  style,
  refreshControl 
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding based on platform and safe area
  const bottomPadding = Platform.select({
    ios: Math.max(insets.bottom, 20),
    android: 20,
    default: 20,
  });

  const Container = scrollable ? ScrollView : View;

  return (
    <Container
      style={[styles.container, style]}
      contentContainerStyle={scrollable ? {
        flexGrow: 1,
        paddingBottom: bottomPadding
      } : undefined}
      refreshControl={scrollable ? refreshControl : undefined}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
}); 