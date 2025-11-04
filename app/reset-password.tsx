import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setEmailSent(true);
      Alert.alert(
        'Email Sent! 📧',
        'Check your inbox for a password reset link. The link will expire in 1 hour.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      let message = 'Failed to send reset email. Please try again.';

      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please try again later.';
      }

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Brand */}
          <View style={styles.brandSection}>
            <ThemedText style={styles.logo}>🔑</ThemedText>
            <ThemedText style={styles.brandName}>Reset Password</ThemedText>
            <ThemedText style={styles.tagline}>
              {emailSent ? 'Check your email' : 'Enter your email to get a reset link'}
            </ThemedText>
          </View>

          {/* Reset Card */}
          <View style={styles.resetCard}>
            {!emailSent ? (
              <>
                <ThemedText style={styles.title}>Forgot Password?</ThemedText>
                <ThemedText style={styles.subtitle}>
                  No worries! Enter your email and we'll send you a reset link.
                </ThemedText>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Email Address</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                {/* Reset Button */}
                <Pressable
                  style={[styles.resetButton, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? ['#9CA3AF', '#6B7280'] : ['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <ThemedText style={styles.buttonText}>
                      {loading ? 'Sending Email...' : 'Send Reset Link'}
                    </ThemedText>
                  </LinearGradient>
                </Pressable>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <ThemedText style={styles.infoIcon}>ℹ️</ThemedText>
                  <View style={styles.infoTextContainer}>
                    <ThemedText style={styles.infoTitle}>How it works:</ThemedText>
                    <ThemedText style={styles.infoText}>
                      1. We'll send you an email with a secure link{'\n'}
                      2. Click the link to open a password reset page{'\n'}
                      3. Enter your new password{'\n'}
                      4. You're all set! Come back and login
                    </ThemedText>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Success State */}
                <View style={styles.successContainer}>
                  <ThemedText style={styles.successIcon}>✅</ThemedText>
                  <ThemedText style={styles.successTitle}>Email Sent!</ThemedText>
                  <ThemedText style={styles.successText}>
                    We've sent a password reset link to:{'\n'}
                    <ThemedText style={styles.emailText}>{email}</ThemedText>
                  </ThemedText>
                  <ThemedText style={styles.successSubtext}>
                    Check your inbox and click the link to reset your password.
                    The link will expire in 1 hour.
                  </ThemedText>
                </View>

                {/* Resend Button */}
                <Pressable
                  style={styles.resendButton}
                  onPress={() => setEmailSent(false)}
                >
                  <ThemedText style={styles.resendText}>Didn't receive it? Try again</ThemedText>
                </Pressable>
              </>
            )}

            {/* Back to Login */}
            <View style={styles.loginSection}>
              <ThemedText style={styles.loginText}>Remember your password? </ThemedText>
              <Pressable onPress={() => router.replace('/login')}>
                <ThemedText style={styles.loginLink}>Sign In</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Security Note */}
          <View style={styles.securitySection}>
            <ThemedText style={styles.securityText}>
              🔒 Secure password reset powered by Firebase Authentication
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },

  // Brand Section
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },

  // Reset Card
  resetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },

  // Input Group
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Reset Button
  resetButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Info Box
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
  },

  // Success State
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '700',
    color: '#667eea',
  },
  successSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },

  // Resend Button
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667eea',
  },

  // Login Section
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 15,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#667eea',
  },

  // Security Section
  securitySection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  securityText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
