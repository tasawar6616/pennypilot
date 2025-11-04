import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { getFirebaseAuth, getFirebaseApp } from '@/lib/firebase-init';
import { FIREBASE_CONFIG } from '@/env/firebase';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';

export default function PhoneRegisterScreen() {
  const recaptchaVerifier = useRef<any>(null);
  const auth = getFirebaseAuth();
  const app = getFirebaseApp();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number with country code (e.g., +923001234567)');
      return;
    }

    setLoading(true);
    try {
      // For React Native with Expo, we need to use PhoneAuthProvider directly
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phone,
        recaptchaVerifier.current
      );

      setVerificationId(verificationId);
      setCodeSent(true);
      Alert.alert('Success', 'OTP sent to your phone! Check your SMS.');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      let message = 'Failed to send OTP. Please try again.';

      if (error.code === 'auth/invalid-phone-number') {
        message = 'Invalid phone number format. Use format: +923001234567';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        message = 'SMS quota exceeded. Please try again later.';
      }

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    if (!verificationId) {
      Alert.alert('Error', 'No verification ID. Please send OTP first.');
      return;
    }

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      Alert.alert('Success', 'Phone number verified! You are now logged in.');
      // Navigation will be handled automatically by AuthContext
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      let message = 'Invalid verification code. Please try again.';

      if (error.code === 'auth/invalid-verification-code') {
        message = 'Invalid verification code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        message = 'Verification code expired. Please request a new one.';
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

      {/* Firebase reCAPTCHA Modal */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={FIREBASE_CONFIG}
        attemptInvisibleVerification={true}
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
            <ThemedText style={styles.logo}>💰</ThemedText>
            <ThemedText style={styles.brandName}>PennyPilot</ThemedText>
            <ThemedText style={styles.tagline}>Track smart · Stay on budget</ThemedText>
          </View>

          {/* Phone Registration Card */}
          <View style={styles.registerCard}>
            <ThemedText style={styles.title}>Phone Registration</ThemedText>
            <ThemedText style={styles.subtitle}>
              {codeSent ? 'Enter verification code' : 'Sign up with your phone number'}
            </ThemedText>

            {!codeSent ? (
              <>
                {/* Phone Number Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Phone Number</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="+92 300 1234567"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <ThemedText style={styles.hint}>
                    Include country code (e.g., +92 for Pakistan)
                  </ThemedText>
                </View>

                {/* Send OTP Button */}
                <Pressable
                  style={[styles.actionButton, loading && styles.buttonDisabled]}
                  onPress={sendOtp}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? ['#9CA3AF', '#6B7280'] : ['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Send OTP</ThemedText>
                    )}
                  </LinearGradient>
                </Pressable>
              </>
            ) : (
              <>
                {/* Verification Code Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Verification Code</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    placeholderTextColor="#9CA3AF"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                  <ThemedText style={styles.hint}>
                    Enter the 6-digit code sent to {phone}
                  </ThemedText>
                </View>

                {/* Verify OTP Button */}
                <Pressable
                  style={[styles.actionButton, loading && styles.buttonDisabled]}
                  onPress={verifyOtp}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Verify & Sign Up</ThemedText>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Resend Code */}
                <Pressable
                  style={styles.resendSection}
                  onPress={() => {
                    setCodeSent(false);
                    setCode('');
                    setVerificationId(null);
                  }}
                  disabled={loading}
                >
                  <ThemedText style={styles.resendText}>Didn't receive the code? </ThemedText>
                  <ThemedText style={styles.resendLink}>Resend</ThemedText>
                </Pressable>
              </>
            )}

            {/* Email Login Link */}
            <View style={styles.loginSection}>
              <ThemedText style={styles.loginText}>Prefer email? </ThemedText>
              <Pressable onPress={() => router.replace('/register')}>
                <ThemedText style={styles.loginLink}>Email Registration</ThemedText>
              </Pressable>
            </View>

            {/* Back to Login */}
            <View style={styles.loginSection}>
              <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
              <Pressable onPress={() => router.replace('/login')}>
                <ThemedText style={styles.loginLink}>Sign In</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.termsSection}>
            <ThemedText style={styles.termsText}>
              By creating an account, you agree to our{'\n'}
              Terms of Service and Privacy Policy
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
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Register Card
  registerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
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
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },

  // Action Button
  actionButton: {
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Resend Section
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
  },

  // Login Section
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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

  // Terms
  termsSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
