import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Heart, ShoppingBag, CheckCircle, ShieldCheck } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ navigation }: any) {
  const [isFav, setIsFav] = useState(false);
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.cardBg }]} edges={['top']}>
      <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.bg} imageStyle={{ opacity: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}><ChevronLeft size={24} color={colors.textPrimary} /></TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}><Share2 size={20} color={colors.textPrimary} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setIsFav(!isFav)}><Heart size={20} color={isFav ? colors.primary : colors.textPrimary} fill={isFav ? colors.primary : 'transparent'} /></TouchableOpacity>
          </View>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <ImageBackground source={require('../../assets/photo_archive_3.png')} style={styles.imagePlaceholder} resizeMode="cover" />
          <View style={styles.contentContainer}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.categoryLabel}>UI Kits</Text>
                <Text style={styles.productTitle}>E-commerce App UI Kit (Figma)</Text>
              </View>
              <Text style={styles.price}>₹2,999</Text>
            </View>
            <Text style={styles.creatorInfo}>by <Text style={{ color: colors.primary, fontWeight: 'bold' }}>D207 / Suita Roy</Text>  ·  4.9 ★ (89 Reviews)</Text>
            <View style={styles.badgesRow}>
              <View style={styles.badge}><CheckCircle size={14} color="#059669" /><Text style={styles.badgeText}>Instant Download</Text></View>
              <View style={styles.badge}><ShieldCheck size={14} color="#059669" /><Text style={styles.badgeText}>Commercial License</Text></View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>A comprehensive UI kit for E-commerce applications. Designed exclusively in Figma, it includes over 60+ beautifully crafted mobile screens spanning across onboarding, catalog, cart, checkout, and user profile flows.{'\n\n'}Features:{'\n'}• 60+ Premium Screens{'\n'}• Fully Customizable Components{'\n'}• Global Styleguide included{'\n'}• Light & Dark mode ready</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>File Details</Text>
            <View style={styles.fileInfoRow}><Text style={styles.fileInfoLabel}>Format</Text><Text style={styles.fileInfoValue}>.fig (Figma)</Text></View>
            <View style={styles.fileInfoRow}><Text style={styles.fileInfoLabel}>File Size</Text><Text style={styles.fileInfoValue}>42.8 MB</Text></View>
            <View style={styles.fileInfoRow}><Text style={styles.fileInfoLabel}>Last Updated</Text><Text style={styles.fileInfoValue}>March 15, 2026</Text></View>
          </View>
        </ScrollView>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.cartBtn}><ShoppingBag size={20} color={colors.textPrimary} /></TouchableOpacity>
          <TouchableOpacity style={styles.buyBtn}><Text style={styles.buyBtnText}>Buy Now</Text></TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safeArea: { flex: 1 },
  header: { backgroundColor: colors.cardBg, position: 'absolute', top: Platform.OS === 'ios' ? 44 : 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, zIndex: 10 },
  headerRight: { flexDirection: 'row', gap: spacing.md },
  iconBtn: { width: 40, height: 40, borderRadius: radii['2xl'], backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  imagePlaceholder: { width, height: width, backgroundColor: colors.borderInput, alignItems: 'center', justifyContent: 'center' },
  contentContainer: { padding: spacing.xl, backgroundColor: colors.cardBg, borderTopLeftRadius: radii['2xl'], borderTopRightRadius: radii['2xl'], marginTop: -24, paddingBottom: spacing['4xl'] },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  categoryLabel: { fontSize: fontSizes.xs + 1, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 1, marginBottom: spacing.xs, fontFamily: fonts.heavy },
  productTitle: { fontSize: fontSizes['2xl'], fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy, lineHeight: 28 },
  price: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, fontFamily: fonts.heavy },
  creatorInfo: { fontSize: fontSizes.sm + 1, color: colors.textSecondary, fontFamily: fonts.medium, marginBottom: spacing.xl },
  badgesRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: spacing.sm, borderRadius: radii.md, gap: spacing.sm },
  badgeText: { fontSize: fontSizes.xs + 1, fontWeight: '600', color: '#059669', fontFamily: fonts.medium },
  divider: { height: 1, backgroundColor: colors.sectionBg, marginVertical: spacing.xl },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy, marginBottom: spacing.md },
  descriptionText: { fontSize: fontSizes.base, color: colors.textSecondary, fontFamily: fonts.body, lineHeight: 24 },
  fileInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.sectionBg },
  fileInfoLabel: { fontSize: fontSizes.sm + 1, color: colors.textSecondary, fontFamily: fonts.medium },
  fileInfoValue: { fontSize: fontSizes.sm + 1, fontWeight: '600', color: colors.textPrimary, fontFamily: fonts.medium },
  bottomBar: { flexDirection: 'row', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg, backgroundColor: colors.cardBg, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.lg },
  cartBtn: { width: 56, height: 56, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderInput, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sectionBg },
  buyBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  buyBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.lg, fontWeight: '700', fontFamily: fonts.heavy },
});
