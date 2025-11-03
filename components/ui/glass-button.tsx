import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  label: string;
  icon?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'ghost';
};

export default function GlassButton({
  label,
  icon,
  onPress,
  style,
  variant = 'primary',
}: Props) {
  const theme = useColorScheme();

  const getBg = () => {
    if (variant === 'ghost') {
      return theme === 'dark'
        ? 'rgba(30, 41, 59, 0.3)'
        : 'rgba(255, 255, 255, 0.5)';
    }
    return theme === 'dark'
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(59, 130, 246, 0.15)';
  };

  const getBorder = () => {
    if (variant === 'ghost') {
      return theme === 'dark'
        ? 'rgba(148, 163, 184, 0.2)'
        : 'rgba(203, 213, 225, 0.5)';
    }
    return theme === 'dark'
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(59, 130, 246, 0.3)';
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBg(),
          borderColor: getBorder(),
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
      <ThemedText style={styles.label} type="defaultSemiBold">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 16,
  },
});
