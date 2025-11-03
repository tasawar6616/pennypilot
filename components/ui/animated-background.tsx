import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Gradients } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const { width, height } = Dimensions.get('window');

// Animated bubble component
function AnimatedBubble({ delay, size, x, y }: { delay: number; size: number; x: number; y: number }) {
  const theme = useColorScheme();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Floating animation
    translateY.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Fade in/out animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 2000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.05, { duration: 2000 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Scale animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2500 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 2500 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const bubbleColor = theme === 'dark'
    ? 'rgba(59, 130, 246, 0.3)'
    : 'rgba(59, 130, 246, 0.2)';

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bubbleColor,
          left: x,
          top: y,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function AnimatedBackground({ children, style }: Props) {
  const theme = useColorScheme();

  const gradientColors = theme === 'dark'
    ? Gradients.dark.mixed
    : Gradients.light.primary;

  // Generate random bubble positions
  const bubbles = [
    { delay: 0, size: 120, x: width * 0.1, y: height * 0.1 },
    { delay: 500, size: 80, x: width * 0.7, y: height * 0.15 },
    { delay: 1000, size: 100, x: width * 0.3, y: height * 0.4 },
    { delay: 1500, size: 140, x: width * 0.8, y: height * 0.5 },
    { delay: 2000, size: 90, x: width * 0.15, y: height * 0.7 },
    { delay: 2500, size: 110, x: width * 0.6, y: height * 0.8 },
  ];

  return (
    <LinearGradient
      colors={gradientColors}
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {/* Animated bubbles */}
      {bubbles.map((bubble, index) => (
        <AnimatedBubble
          key={index}
          delay={bubble.delay}
          size={bubble.size}
          x={bubble.x}
          y={bubble.y}
        />
      ))}

      {/* Content */}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  bubble: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
