// ============================================
// ConsultantDashboard — Sales Dashboard sub-screen
// Role: CONSULTANT | Product: B (Artwork Marketplace)
// Figma: "Sales Dashboard.png"
// Reads: artwork_orders (NOT projects table)
// ============================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../TopHeader';
import { FileText, Truck, CreditCard, CheckSquare, TrendingUp, IndianRupee } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { fetchConsultantEarnings } from '../../services/projectService';
import { colors, fonts, fontSizes, spacing, radii } from '../../styles/theme';
import { RemoteAssets } from '../../lib/assets';
import type { ArtworkOrder } from '../../types';
import type { MainTabScreenProps } from '../../types/navigation';

const ORANGE_TITLE = '#E87B35';
const NAVY = '#1B3A5C';
const ACCEPT_BG = NAVY;
const DECLINE_COLOR = '#E87B35';

interface ConsultantDashboardProps {
  navigation: MainTabScreenProps<'Dashboard'>['navigation'];
}

export default function ConsultantDashboard({ navigation }: ConsultantDashboardProps) {
  const profile = useAuthStore((s) => s.profile);
  const consultantProfile = useAuthStore((s) => s.consultantProfile);

  const [orders, setOrders] = useState<ArtworkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agreedOrders, setAgreedOrders] = useState<Set<string>>(new Set());
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, thisMonth: 0 });

  const artistId = consultantProfile?.user_id ?? profile?.id;

  // Fetch incoming artwork purchase requests from artwork_orders (Product B)
  // Never falls back to projects table
  async function fetchOrders() {
    if (!artistId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('artwork_orders')
        .select(
          '*, shop_products(title,description,price,images,category), buyer_profile:profiles!buyer_id(name,avatar_url)'
        )
        .eq('artist_id', artistId)
        .eq('status', 'requested')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data ?? []) as ArtworkOrder[]);
    } catch (e: any) {
      console.warn('[ConsultantDashboard] artwork_orders fetch error:', e.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchOrders(); }, [artistId]);

  useEffect(() => {
    if (!artistId) return;
    fetchConsultantEarnings(artistId)
      .then(setEarnings)
      .catch((e) => console.warn('[ConsultantDashboard] earnings error:', e));
  }, [artistId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
  }, [artistId]);

  function toggleTerms(orderId: string) {
    setAgreedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  async function onAccept(order: ArtworkOrder) {
    if (!agreedOrders.has(order.id)) {
      Alert.alert('Terms Required', 'Please agree to the Terms and Conditions first.');
      return;
    }
    try {
      const { error } = await supabase
        .from('artwork_orders')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', order.id);
      if (error) throw error;
      Alert.alert('Done', 'Request accepted! The buyer has been notified.');
      fetchOrders();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong.');
    }
  }

  async function onDecline(order: ArtworkOrder) {
    Alert.alert('Decline Request', 'Are you sure you want to decline this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('artwork_orders')
              .update({ status: 'declined', updated_at: new Date().toISOString() })
              .eq('id', order.id);
            if (error) throw error;
            Alert.alert('Done', 'Request declined.');
            fetchOrders();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Something went wrong.');
          }
        },
      },
    ]);
  }

  function formatAmount(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  function renderPendingCard({ item }: { item: ArtworkOrder }) {
    const isAgreed = agreedOrders.has(item.id);
    const artwork = item.shop_products;
    const coverImage = artwork?.images?.[0] ?? null;
    const buyerName = (item.buyer_profile as any)?.name ?? 'Collector';

    return (
      <View style={styles.requestCard}>
        <Text style={styles.requestTitle}>{'Request received\nfor Purchase'}</Text>

        <Text style={styles.sectionLabel}>ARTWORK DETAIL</Text>
        <View style={styles.artworkImageContainer}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.artworkImage} resizeMode="cover" />
          ) : (
            <View style={styles.artworkPlaceholder}>
              <Text style={styles.artworkName}>{artwork?.title ?? 'Untitled'}</Text>
              <Text style={styles.artworkCategory}>{artwork?.category ?? 'Artwork'}</Text>
            </View>
          )}
          {coverImage && (
            <View style={styles.artworkOverlay}>
              <Text style={styles.artworkName}>{artwork?.title ?? 'Untitled'}</Text>
              <Text style={styles.artworkCategory}>{artwork?.category ?? 'Artwork'}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Truck size={18} color={ORANGE_TITLE} strokeWidth={2} />
          <Text style={styles.infoLabel}>DELIVERY ADDRESS</Text>
        </View>
        <Text style={styles.infoText}>
          {item.delivery_address || 'Address will be confirmed by buyer'}
        </Text>

        <View style={[styles.infoRow, { marginTop: spacing.xl }]}>
          <CreditCard size={18} color={ORANGE_TITLE} strokeWidth={2} />
          <Text style={styles.infoLabel}>PAYMENT STATUS</Text>
        </View>
        <View style={styles.paymentInfo}>
          <View style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.infoText}>Invoice will be raised on acceptance</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.infoText}>Artwork cost: ({formatCurrency(item.artwork_price ?? 0)})</Text>
          </View>
          <Text style={styles.paymentNote}>
            Funds will be released upon delivery confirmation.
          </Text>
        </View>

        {/* About the buyer */}
        <Text style={styles.sectionLabel}>ABOUT THE BUYER</Text>
        <View style={styles.buyerRow}>
          <View style={styles.buyerAvatar}>
            <Text style={styles.buyerInitial}>{buyerName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.buyerName}>{buyerName}</Text>
            <Text style={styles.buyerTag}>Verified Collector since 2021</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => toggleTerms(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isAgreed && styles.checkboxChecked]}>
            {isAgreed && <CheckSquare size={16} color="#fff" strokeWidth={2.5} />}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms and condition</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.acceptBtn, !isAgreed && { opacity: 0.5 }]}
            onPress={() => onAccept(item)}
            disabled={!isAgreed}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptText}>Accept Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => onDecline(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.declineText}>Pass on</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  type SectionItem =
    | { type: 'header' }
    | { type: 'pending'; order: ArtworkOrder }
    | { type: 'empty' };

  const sections: SectionItem[] = [];
  sections.push({ type: 'header' });

  if (loading) {
    // loading handled outside FlatList
  } else if (orders.length === 0) {
    sections.push({ type: 'empty' });
  } else {
    orders.forEach((o) => sections.push({ type: 'pending', order: o }));
  }

  return (
    <ImageBackground source={{ uri: RemoteAssets.bgTexture }} style={styles.bg} imageStyle={{ opacity: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TopHeader />
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={sections}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item: section }) => {
              if (section.type === 'header') {
                return (
                  <View style={styles.headerSection}>
                    <Text style={styles.dashboardTitle}>{'Sales\nDashboard'}</Text>
                    <Text style={styles.dashboardSubtitle}>
                      Manage your creative transactions, pending artwork requests, and fulfillment status for your global collectors.
                    </Text>

                    {/* Utility navigation tiles */}
                    <View style={styles.quickGrid}>
                      <TouchableOpacity
                        style={styles.quickBtn}
                        onPress={() => (navigation as any).navigate('ConsultantEarningsHistory')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.quickLabel}>{'Sales\nHistory'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.quickBtn}
                        onPress={() => (navigation as any).navigate('ConsultantProjectManagement')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.quickLabel}>{'Manage\nProjects'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.quickBtn}
                        onPress={() => (navigation as any).navigate('ConsultantPortfolioUpdate')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.quickLabel}>{'Update\nPortfolio'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.quickBtn}
                        onPress={() => (navigation as any).navigate('ConsultantServicePricing')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.quickLabel}>{'Service\nPricing'}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.earningsCard}>
                      <Text style={styles.earningsLabel}>TOTAL EARNED</Text>
                      <Text style={styles.earningsAmount}>{formatAmount(earnings.total)}</Text>
                      <View style={styles.earningsRow}>
                        <View style={styles.earningsItem}>
                          <TrendingUp size={14} color="#7DD3C0" />
                          <Text style={styles.earningsItemLabel}>This Month</Text>
                          <Text style={styles.earningsItemValue}>{formatAmount(earnings.thisMonth)}</Text>
                        </View>
                        <View style={styles.earningsDivider} />
                        <View style={styles.earningsItem}>
                          <IndianRupee size={14} color="#FBD38D" />
                          <Text style={styles.earningsItemLabel}>Pending</Text>
                          <Text style={[styles.earningsItemValue, { color: '#FBD38D' }]}>{formatAmount(earnings.pending)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }

              if (section.type === 'pending') return renderPendingCard({ item: section.order });

              if (section.type === 'empty') {
                return (
                  <View style={styles.emptyState}>
                    <FileText size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No purchase requests yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Incoming artwork purchase requests will appear here
                    </Text>
                  </View>
                );
              }

              return null;
            }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },

  headerSection: { paddingTop: 16, marginBottom: 8 },
  dashboardTitle: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: fonts.heavy,
    color: ORANGE_TITLE,
    lineHeight: 42,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  dashboardSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: 8,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickBtn: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#F3F4F6',
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickBtnActive: {
    backgroundColor: '#fff',
    borderColor: NAVY,
    borderWidth: 1.5,
  },
  quickLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  quickLabelActive: {
    color: NAVY,
    fontWeight: '700',
  },

  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  requestTitle: {
    fontSize: fontSizes['3xl'] + 2,
    fontWeight: '800',
    fontFamily: fonts.heavy,
    color: NAVY,
    lineHeight: 34,
    marginBottom: spacing.lg,
  },

  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  artworkImageContainer: {
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    height: 200,
    position: 'relative',
  },
  artworkImage: { width: '100%', height: '100%' },
  artworkPlaceholder: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  artworkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: spacing.lg,
  },
  artworkName: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: '#fff',
  },
  artworkCategory: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: '#D1D5DB',
    marginTop: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  infoText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  paymentInfo: { marginBottom: spacing.lg },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: NAVY,
    marginTop: 8,
  },
  paymentNote: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: ORANGE_TITLE,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    lineHeight: 20,
  },

  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  buyerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D8B7F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerInitial: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: fonts.heavy },
  buyerName: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY },
  buyerTag: { fontSize: fontSizes.xs + 1, fontFamily: fonts.body, color: colors.textSecondary },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: NAVY, borderColor: NAVY },
  termsText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    flex: 1,
  },
  termsLink: { color: colors.primary, textDecorationLine: 'underline' },

  actionRow: { flexDirection: 'row', gap: spacing.md },
  acceptBtn: {
    backgroundColor: ACCEPT_BG,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.5,
  },
  acceptText: { color: '#fff', fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy },
  declineBtn: {
    borderWidth: 1.5,
    borderColor: DECLINE_COLOR,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  declineText: { color: DECLINE_COLOR, fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
  emptySubtitle: { fontSize: 13, fontFamily: fonts.body, color: '#D1D5DB', textAlign: 'center' },

  earningsCard: {
    backgroundColor: '#1A2C4E',
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  earningsLabel: {
    fontSize: fontSizes.xs + 1, fontWeight: '700', fontFamily: fonts.heavy,
    color: '#9CA3AF', letterSpacing: 1, marginBottom: spacing.sm,
  },
  earningsAmount: {
    fontSize: 38, fontWeight: '800', fontFamily: fonts.heavy,
    color: '#FFFFFF', marginBottom: spacing.lg,
  },
  earningsRow: { flexDirection: 'row', alignItems: 'center' },
  earningsItem: { flex: 1, alignItems: 'center', gap: 4 },
  earningsDivider: {
    width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: spacing.md,
  },
  earningsItemLabel: { fontSize: fontSizes.xs, fontFamily: fonts.body, color: '#9CA3AF' },
  earningsItemValue: { fontSize: fontSizes.lg, fontWeight: '700', fontFamily: fonts.heavy, color: '#7DD3C0' },
});
