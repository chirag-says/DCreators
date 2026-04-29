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
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const { signInWithOTP, isLoading } = useAuthStore();

  const canRegister = name.trim().length > 0 && email.trim().length > 0 && email.includes('@');

  async function handleRegister() {
    if (!canRegister) return;

    const result = await signInWithOTP(email.trim().toLowerCase());
    if (result.success) {
      navigation.navigate('OTPVerification', {
        email: email.trim().toLowerCase(),
        userName: name.trim(),
        registerData: { phone },
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Top spacing */}
            <View style={{ height: spacing['3xl'] }} />

            {/* Logo — centered (Figma A1.2) */}
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/dcreators-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={{ height: spacing['4xl'] }} />

            {/* Form fields (Figma A1.2: Name, Mail, Mobile Number, OTP row) */}
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={styles.input}
                placeholder="Mail"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor={colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              {/* Sign Up button — sends OTP & navigates to OTP screen */}
              <TouchableOpacity
                style={[styles.signUpButton, (!canRegister || isLoading) && { opacity: 0.5 }]}
                activeOpacity={0.85}
                onPress={handleRegister}
                disabled={!canRegister || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textOnPrimary} size="small" />
                ) : (
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Sign In link */}
              <TouchableOpacity
                style={styles.signInLink}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.signInLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom bar with back chevron (Figma pattern) */}
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
  scrollContent: {
    paddingBottom: spacing['4xl'],
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

  // Sign Up button
  signUpButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing['4xl'],
    borderRadius: radii.full,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 180,
    marginTop: spacing.sm,
  },
  signUpButtonDisabled: {
    backgroundColor: colors.btnDisabled,
  },
  signUpButtonText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },

  // Sign In link
  signInLink: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  signInLinkText: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },

  // Bottom bar
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
