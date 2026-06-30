import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Heart, Award, Tag, ShieldCheck, Box, Camera, Hash, BadgeCheck } from 'lucide-react-native';
import TopHeader from '../components/TopHeader';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';
import { RemoteAssets } from '../lib/assets';


const { width } = Dimensions.get('window');

const AVATAR_IMAGES: Record<string, any> = {
  photographer: { uri: RemoteAssets.photographer },
  designer: { uri: RemoteAssets.designer },
  sculptor: { uri: RemoteAssets.sculptor },
  artisan: { uri: RemoteAssets.artisan },
  photo_archive_1: { uri: RemoteAssets.photoArchive1 },
  photo_archive_2: { uri: RemoteAssets.photoArchive2 },
  photo_archive_3: { uri: RemoteAssets.photoArchive3 },
  design_hub_1: { uri: RemoteAssets.designHub1 },
  design_hub_2: { uri: RemoteAssets.designHub2 },
  design_hub_3: { uri: RemoteAssets.designHub3 },
};

const CATEGORY_LABELS: Record<string, string> = {
  photographer: 'Photography',
  designer: 'Design',
  sculptor: 'Sculpture',
  artisan: 'Traditional Craft',
};

export default function CreatorProfileScreen({ route, navigation }: any) {
  const creator = route?.params?.creator;
  const [activeImage, setActiveImage] = useState(0);
  const [fav, setFav] = useState(false);
  const currentRole = useAuthStore((s) => s.currentRole);

  const name = creator?.name || 'Creator';
  const code = creator?.code || 'D000';
  const subtitle = creator?.subtitle || '';
  const experience = creator?.experience || '';
  const expertise = creator?.expertise || '';
  const category = creator?.category || 'photographer';
  const basePrice = creator?.base_price;
  const avatarKey = creator?.avatarKey || category;
  const portfolioKeys: string[] = creator?.portfolioKeys || getDefaultPortfolio(category);

  // Derive display fields matching the Figma layout
  const categoryLabel = CATEGORY_LABELS[category] || category.charAt(0).toUpperCase() + category.slice(1);
  const productCode = `${code.replace('D', 'BB')}/01`;

  function getDefaultPortfolio(cat: string): string[] {
    switch (cat) {
      case 'photographer': return ['photo_archive_1', 'photo_archive_2', 'photo_archive_3'];
      case 'designer': return ['design_hub_1', 'design_hub_2', 'design_hub_3'];
      default: return [cat, cat, cat];
    }
  }

  const hasRealAvatar = creator?.avatar_url && creator.avatar_url.startsWith('http');
  const avatarSource = hasRealAvatar
    ? { uri: creator.avatar_url }
    : (AVATAR_IMAGES[avatarKey] || AVATAR_IMAGES.photographer);

  const realPortfolioImages = creator?.portfolio_images?.filter((uri: string) => uri && uri.length > 0) || [];
  const portfolioImages = realPortfolioImages.length > 0
    ? realPortfolioImages.map((uri: string) => ({ uri }))
    : portfolioKeys.map((key: string) => AVATAR_IMAGES[key] || AVATAR_IMAGES.photographer);

  const expertiseLabel = expertise ? expertise.split(',')[0]?.trim() : categoryLabel;

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TopHeader />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>

          {/* ── Title row: back + category + favorite ── */}
          <View style={styles.titleRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
              <ChevronLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.categoryTitle}>{categoryLabel}</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.favBtn} onPress={() => setFav(f => !f)} activeOpacity={0.8}>
              <Heart size={20} color={fav ? colors.orange : colors.primary} fill={fav ? colors.orange : 'transparent'} />
            </TouchableOpacity>
          </View>

          {/* ── Large Artwork Image Card ── */}
          <View style={styles.artworkCard}>
            <Image
              source={portfolioImages[activeImage]}
              style={styles.artworkImage}
              resizeMode="cover"
            />
            {portfolioImages.length > 1 && (
              <>
                {/* Circular nav buttons */}
                <TouchableOpacity style={[styles.navCircle, styles.navCircleL]} activeOpacity={0.85} onPress={() => setActiveImage(p => p > 0 ? p - 1 : portfolioImages.length - 1)}>
                  <ChevronLeft size={22} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navCircle, styles.navCircleR]} activeOpacity={0.85} onPress={() => setActiveImage(p => p < portfolioImages.length - 1 ? p + 1 : 0)}>
                  <ChevronRight size={22} color={colors.primary} />
                </TouchableOpacity>
                {/* Counter pill */}
                <View style={styles.counterWrap} pointerEvents="none">
                  <View style={styles.counterPill}>
                    <Text style={styles.counterText}>{activeImage + 1} / {portfolioImages.length}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Dots indicator */}
          {portfolioImages.length > 1 && (
            <View style={styles.dotsRow}>
              {portfolioImages.map((_: any, i: number) => (
                <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* ── Profile Card ── */}
          <View style={styles.profileCard}>
            {/* Header: avatar + name + experience pill */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrap}>
                <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
                <BadgeCheck size={30} color="#fff" fill="#2D9CDB" style={styles.verifiedBadge} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{subtitle || 'Creative Consultant'}</Text>
                {experience ? (
                  <View style={styles.expPill}>
                    <Award size={13} color={colors.primary} />
                    <Text style={styles.expPillText}>{experience} Years Experience</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCol, styles.statDivider]}>
                <Hash size={18} color={colors.primary} />
                <Text style={styles.statLabel}>Code</Text>
                <Text style={styles.statValue} numberOfLines={1}>{code}</Text>
              </View>
              <View style={[styles.statCol, styles.statDivider]}>
                <Box size={18} color={colors.primary} />
                <Text style={styles.statLabel}>Product Code</Text>
                <Text style={styles.statValue} numberOfLines={1}>{productCode}</Text>
              </View>
              <View style={[styles.statCol, styles.statDivider]}>
                <Camera size={18} color={colors.primary} />
                <Text style={styles.statLabel}>Expertise</Text>
                <Text style={styles.statValue} numberOfLines={1}>{expertiseLabel}</Text>
              </View>
              <View style={styles.statCol}>
                <Award size={18} color={colors.primary} />
                <Text style={styles.statLabel}>Experience</Text>
                <Text style={styles.statValue} numberOfLines={1}>{experience ? `${experience} Years` : '—'}</Text>
              </View>
            </View>

            {/* Price + verified row */}
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <View style={styles.tagIconWrap}>
                  <Tag size={18} color={colors.teal} />
                </View>
                <View>
                  <Text style={styles.priceCaption}>Price</Text>
                  {basePrice ? (
                    <Text style={styles.priceValue}>₹ {basePrice.toLocaleString('en-IN')} <Text style={styles.priceUnit}>(INR)</Text></Text>
                  ) : (
                    <Text style={styles.priceValue}>On request</Text>
                  )}
                </View>
              </View>
              <View style={styles.verifiedChip}>
                <ShieldCheck size={14} color={colors.teal} />
                <Text style={styles.verifiedChipText}>Verified Creator</Text>
              </View>
            </View>
          </View>

          {/* ── Hire Now CTA (client / buyer view only) ── */}
          {currentRole !== 'consultant' && (
            <TouchableOpacity
              style={styles.hireBtn}
              onPress={() => navigation.navigate('BookConsultant', { consultant: creator })}
              activeOpacity={0.85}
            >
              <Text style={styles.hireBtnText}>Hire Now  →</Text>
              <View style={styles.hireSubRow}>
                <ShieldCheck size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.hireSubText}>Secure • Verified • Trusted</Text>
              </View>
            </TouchableOpacity>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 28,
  },

  /* ── Title row ── */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  backBtn: {
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heavy,
    fontWeight: '800',
    color: colors.primary,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  favBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.cardBg,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },

  /* ── Large artwork card ── */
  artworkCard: {
    width: '100%',
    aspectRatio: 1.05,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...shadows.lg,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  navCircle: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    ...shadows.md,
  },
  navCircleL: { left: 14 },
  navCircleR: { right: 14 },
  counterWrap: {
    position: 'absolute', left: 0, right: 0, bottom: 14,
    alignItems: 'center',
  },
  counterPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: radii.full,
  },
  counterText: {
    color: '#fff',
    fontSize: fontSizes.xs + 1,
    fontFamily: fonts.heavy,
    fontWeight: '700',
  },

  /* ── Dots ── */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: colors.borderInput,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },

  /* ── Profile card ── */
  profileCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.card,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 3, borderColor: colors.cardBg,
    backgroundColor: colors.inputBg,
    ...shadows.sm,
  },
  avatar: {
    width: '100%', height: '100%', borderRadius: 42,
  },
  verifiedBadge: {
    position: 'absolute', bottom: -2, right: -2,
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heavy,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  expPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.sectionBg,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1, borderColor: colors.borderCard,
  },
  expPillText: {
    fontSize: fontSizes.xs + 1,
    fontFamily: fonts.medium,
    fontWeight: '600',
    color: colors.primary,
  },

  /* ── Stats grid ── */
  statsGrid: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radii.lg,
    backgroundColor: colors.sectionBg,
    paddingVertical: spacing.md,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: colors.borderCard,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: fonts.medium,
    color: colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: fontSizes.xs + 1,
    fontFamily: fonts.heavy,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },

  /* ── Price + verified row ── */
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    backgroundColor: colors.sectionBg,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#E0F5F1',
    alignItems: 'center', justifyContent: 'center',
  },
  priceCaption: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    color: colors.textTertiary,
  },
  priceValue: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heavy,
    fontWeight: '800',
    color: colors.teal,
  },
  priceUnit: {
    fontSize: fontSizes.xs + 1,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  verifiedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E0F5F1',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radii.full,
  },
  verifiedChipText: {
    fontSize: fontSizes.xs + 1,
    fontFamily: fonts.heavy,
    fontWeight: '700',
    color: colors.teal,
  },

  /* ── Hire Now CTA ── */
  hireBtn: {
    backgroundColor: '#1B3A5C',
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: 24,
    ...shadows.md,
  },
  hireBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: fonts.heavy,
  },
  hireSubRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 5,
  },
  hireSubText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSizes.xs + 1,
    fontFamily: fonts.medium,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
