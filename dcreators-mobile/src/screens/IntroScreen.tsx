import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Palette, ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function IntroScreen({ navigation, route }: any) {
  const userName = route?.params?.userName || 'User';
  const { setRole, consultantProfile, profile } = useAuthStore();

  const displayName = profile?.name || userName;

  function handleRole(role: 'viewer' | 'creator') {
    if (role === 'creator') {
      setRole('consultant');
      if (consultantProfile) {
        // Already onboarded as consultant — go to dashboard
        navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Dashboard' } }] });
      } else {
        // Needs consultant onboarding
        navigation.navigate('CreatorOnboarding');
      }
    } else {
      setRole('client');
      navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Dashboard' } }] });
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/bg-texture.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Top spacer */}
          <View style={{ height: spacing['4xl'] }} />

          {/* Logo — centered (Figma A1.4) */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/dcreators-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Spacer before cards */}
          <View style={{ height: spacing['4xl'] }} />

          {/* Role Cards (Figma A1.4) */}
          <View style={styles.cardsContainer}>

            {/* Viewer / Client Card */}
            <TouchableOpacity
              style={[styles.roleCard, styles.clientCard]}
              activeOpacity={0.85}
              onPress={() => handleRole('viewer')}
            >
              <Text style={styles.roleJoinAs}>Join as</Text>
              <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>VIEWER/CLIENT</Text>
              <Text style={styles.roleDesc}>Hire Creative Consultant</Text>
              <Text style={styles.roleDesc}>Assign Projects</Text>
              <Text style={styles.roleDesc}>Buy Artwork</Text>

              {/* Icon circle — orange (Client) */}
              <View style={[styles.roleIconCircle, { backgroundColor: colors.orange }]}>
                <Users size={24} color="#fff" strokeWidth={2} />
              </View>
            </TouchableOpacity>

            {/* Creative Consultant Card */}
            <TouchableOpacity
              style={[styles.roleCard, styles.consultantCard]}
              activeOpacity={0.85}
              onPress={() => handleRole('creator')}
            >
              <Text style={styles.roleJoinAs}>Join as</Text>
              <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>CREATIVE CONSULTANT</Text>
              <Text style={styles.roleDesc}>Explore Creative Projects</Text>
              <Text style={styles.roleDesc}>Grow Business</Text>
              <Text style={styles.roleDesc}>Sell Artwork</Text>

              {/* Icon circle — indigo (Consultant) */}
              <View style={[styles.roleIconCircle, { backgroundColor: colors.primary }]}>
                <Palette size={24} color="#fff" strokeWidth={2} />
              </View>
            </TouchableOpacity>

          </View>

        </ScrollView>

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
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing['2xl'], paddingBottom: spacing['4xl'] },

  // Logo
  logoWrap: { alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: width * 0.75, height: 130 },

  // Cards
  cardsContainer: { gap: spacing['3xl'] },

  // Role card base
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radii.xl,
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.md,
  },

  // Client card — indigo border (Figma A1.4)
  clientCard: {
    borderColor: colors.primary,
  },

  // Consultant card — teal border (Figma A1.4)
  consultantCard: {
    borderColor: colors.teal,
  },

  roleJoinAs: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  roleTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heavy,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  roleDesc: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Overlapping icon circle at card bottom
  roleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -28,
    ...shadows.md,
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
