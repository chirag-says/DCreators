import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  return (
    <ImageBackground
      source={require('../../assets/bg-texture.png')}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        {/* Top breathing room */}
        <View style={{ flex: 2.2 }} />

        {/* Logo — centered (matching Figma A1.1) */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/dcreators-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Description block (matching Figma A1.1 text) */}
        <View style={styles.textBlock}>
          <Text style={styles.description}>
            This unique app bridges creators and clients, allowing Photographers, Designers and Artisans to showcase their work to global audiences. Users can explore, purchase and hire creative consultants for custom projects through seamless negotiation for creative projects/assignments. With it's versatile range of services and strong market potential, it serves as a comprehensive hub for creative collaboration.
          </Text>
        </View>

        {/* Flexible bottom space */}
        <View style={{ flex: 2 }} />

        {/* Sign In button — Figma A1.1 uses filled indigo rounded pill */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        {/* Sign Up link — text-only below button */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.7}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
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
    paddingHorizontal: spacing['3xl'],
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: width * 0.85,
    height: 160,
  },
  textBlock: {
    paddingHorizontal: spacing.xs,
  },
  description: {
    fontSize: fontSizes.md,
    fontWeight: '400',
    fontFamily: fonts.body,
    color: colors.textSecondary,
    textAlign: 'justify',
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  // Figma A1.1: filled indigo rounded pill button
  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing['4xl'],
    borderRadius: radii.full,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 180,
    ...shadows.md,
  },
  signInText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    fontFamily: fonts.medium,
    letterSpacing: 0.3,
  },
  // Figma A1.1: plain text link below
  signUpButton: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  signUpText: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
});
