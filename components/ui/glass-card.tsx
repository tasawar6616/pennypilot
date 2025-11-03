import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'primary' | 'accent';
};

export default function GlassCard({ children, style, variant = 'default' }: Props) {
  const theme = useColorScheme();

  const getBackgroundColor = () => {
    if (theme === 'dark') {
      switch (variant) {
        case 'primary':
          return 'rgba(30, 41, 59, 0.5)';
        case 'accent':
          return 'rgba(30, 41, 59, 0.5)';
        default:
          return 'rgba(30, 41, 59, 0.4)';
      }
    } else {
      switch (variant) {
        case 'primary':
          return 'rgba(255, 255, 255, 0.9)';
        case 'accent':
          return 'rgba(255, 255, 255, 0.85)';
        default:
          return 'rgba(255, 255, 255, 0.7)';
      }
    }
  };

  const getBorderColor = () => {
    return theme === 'dark'
      ? 'rgba(148, 163, 184, 0.15)'
      : 'rgba(226, 232, 240, 0.8)';
  };

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
});
