import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const { signInWithOTP, isLoading } = useAuthStore();

  const canLogin = email.trim().length > 0;

  async function handleLogin() {
    if (!canLogin) return;

    const result = await signInWithOTP(email.trim().toLowerCase());
    if (result.success) {
      navigation.navigate('OTPVerification', {
        email: email.trim().toLowerCase(),
        userName: '',
      });
    } else {
      Alert.alert('Error', result.error || 'Failed to send OTP. Please try again.');
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/bg-texture.png')}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={10}
        >
          {/* Top spacing */}
          <View style={{ flex: 1.5 }} />

          {/* Logo — centered (Figma A1.3) */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/dcreators-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Spacer */}
          <View style={{ flex: 1.2 }} />

          {/* Form fields (Figma A1.3: Name/Mail, Mobile Number, OTP row) */}
          <View style={styles.formContainer}>
            {/* Email / Name input */}
            <TextInput
              style={styles.input}
              placeholder="Name/Mail"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Mobile Number input */}
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* Sign In button — sends OTP & navigates to OTP screen */}
            <TouchableOpacity
              style={[styles.signInButton, (!canLogin || isLoading) && { opacity: 0.5 }]}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={!canLogin || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textOnPrimary} size="small" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up link */}
            <TouchableOpacity
              style={styles.signUpLink}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpLinkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />
        </KeyboardAvoidingView>

        {/* Bottom back button bar (Figma shows back chevron at bottom) */}
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  container: {
    flex: 1,
  },

  // Logo
  logoWrapper: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7,
    height: 120,
  },

  // Form
  formContainer: {
    paddingHorizontal: spacing['3xl'],
    gap: spacing.lg,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: 15,
    fontSize: fontSizes.lg,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },

  // OTP row
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  otpInput: {
    flex: 1,
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.full,
  },
  verifyBtnText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.base,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  resendBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
  },
  resendBtnText: {
    color: colors.primary,
    fontSize: fontSizes.base,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },

  // Sign In button
  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing['4xl'],
    borderRadius: radii.full,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 180,
    marginTop: spacing.sm,
  },
  signInButtonDisabled: {
    backgroundColor: colors.btnDisabled,
  },
  signInButtonText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },

  // Sign Up link
  signUpLink: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  signUpLinkText: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },

  // Bottom bar with back button (Figma pattern)
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
  },
  backBtn: {
    padding: spacing.xs,
  },
});
