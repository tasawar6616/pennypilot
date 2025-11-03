import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function GradientBackground({ children, style }: Props) {
  const theme = useColorScheme();

  // Clean, minimal gradients
  const lightGradient = [
    '#FFFFFF',
    '#F8FAFC',
    '#F1F5F9',
    '#E2E8F0',
  ];

  const darkGradient = [
    '#0F172A',
    '#1E293B',
    '#0F172A',
    '#1E293B',
  ];

  const colors = theme === 'dark' ? darkGradient : lightGradient;

  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.4, 0.7, 1]}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
