/**
 * WelcomeScreen — "Welcome to Dcreators"
 * Matches Figma: "Welcome to Dcreators.png"
 * 
 * Layout (top→bottom):
 * 1. DCreators full logo (centered, large)
 * 2. Headline: "Hire creatives. Buy art. Build ideas."
 * 3. Long description paragraph (centered)
 * 4. Tagline: "Explore, hire, and collaborate with..."
 * 5. "Sign up" button (outline, full-width)
 * 6. Footer attribution (Joint Venture credits)
 * 
 * Background: Pure white (#FFFFFF) per Figma
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSizes, spacing, radii } from '../styles/theme';
import { RemoteAssets } from '../lib/assets';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Logo ─────────────────────────────────────── */}
        <View style={styles.logoWrapper}>
          <Image
            source={{ uri: RemoteAssets.dcreatorsLogo }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* ── Headline ─────────────────────────────────── */}
        <Text style={styles.headline}>
          Hire creatives. Buy art. Build ideas.
        </Text>

        {/* ── Description ──────────────────────────────── */}
        <Text style={styles.description}>
          This unique app bridges creators and clients in one platform, allowing
          photographers, designers, and artisans to showcase their work to global
          audiences. Users can explore, purchase, and hire creative consultants
          for custom projects through seamless negotiation for creative projects/
          assignment. With its versatile range of services and strong market
          potential, it serves as a comprehensive hub for creative collaboration.
        </Text>

        {/* ── Tagline ──────────────────────────────────── */}
        <Text style={styles.tagline}>
          Explore, hire, and collaborate with photographers, designers, artists,
          and artisans.
        </Text>

        {/* ── Spacer ───────────────────────────────────── */}
        <View style={{ flex: 1, minHeight: 32 }} />

        {/* ── Sign Up Button (outline style per Figma) ─── */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
        >
          <Text style={styles.signUpText}>Sign up</Text>
        </TouchableOpacity>

        {/* ── Already have account ─────────────────────── */}
        <TouchableOpacity
          style={styles.signInRow}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.signInPrompt}>Already have an account? </Text>
          <Text style={styles.signInLink}>Sign in</Text>
        </TouchableOpacity>

        {/* ── Footer Attribution (per Figma) ───────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            A Joint Venture of{' '}
            <Text style={styles.footerBold}>Ishisoft Pvt.Ltd</Text>,{' '}
            <Text style={styles.footerBold}>Mr. Shoumik Mazumder</Text> and
          </Text>
          <Text style={styles.footerText}>
            <Text style={styles.footerBold}>Design &amp; Animation Club</Text>,
            Department of Visual Arts, AUS
          </Text>
          <Text style={styles.footerText}>
            Honorary Design Mentor -{' '}
            <Text style={styles.footerBold}>Dr. Gautam Dutta</Text>,
            Department of Visual Arts, AUS
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',   // Pure white per Figma
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing['3xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['2xl'],
  },

  // ── Logo ──────────────────────────────────────
  logoWrapper: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logo: {
    width: width * 0.72,
    height: 80,
  },

  // ── Text ──────────────────────────────────────
  headline: {
    fontSize: fontSizes['2xl'],
    fontWeight: '400',
    fontFamily: fonts.body,
    color: colors.textSecondary,     // Muted gray heading per Figma
    textAlign: 'left',
    marginBottom: spacing['2xl'],
    lineHeight: 30,
    letterSpacing: 0.1,
  },
  description: {
    fontSize: fontSizes.md + 1,
    fontWeight: '400',
    fontFamily: fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.1,
    marginBottom: spacing.xl,
  },
  tagline: {
    fontSize: fontSizes.md,
    fontWeight: '400',
    fontFamily: fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['2xl'],
  },

  // ── Sign Up Button (outline per Figma) ────────
  signUpButton: {
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderRadius: radii.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'transparent',
  },
  signUpText: {
    fontSize: fontSizes.lg,
    fontWeight: '500',
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  // ── Sign In row ───────────────────────────────
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  signInPrompt: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textSecondary,
  },
  signInLink: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.primary,
    fontWeight: '600',
  },

  // ── Footer ────────────────────────────────────
  footer: {
    alignItems: 'center',
    gap: 3,
    paddingTop: spacing.sm,
  },
  footerText: {
    fontSize: fontSizes.xs + 1,
    fontFamily: fonts.body,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerBold: {
    fontFamily: fonts.heavy,
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
