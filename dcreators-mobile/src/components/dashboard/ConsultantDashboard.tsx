// ============================================
// ConsultantDashboard — "Sales Dashboard"
// Matches Figma: "Sales Dashboard.png" / "Sales Dashboard-1.png"
//
// Layout:
// - TopHeader (D icon + notification + avatar)
// - "Sales Dashboard" heading (orange gradient)
// - Description subtitle
// - Pending assignment cards:
//   - Project/artwork title + image
//   - Delivery address
//   - Payment status info
//   - Terms checkbox + Accept/Decline buttons
//   - About the Buyer section
// - Active projects list
// ============================================

import React, { useState, useCallback } from 'react';
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
import ProjectCard from './ProjectCard';
import { FileText, Truck, CreditCard, CheckSquare, TrendingUp, IndianRupee } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useConsultantProjects } from '../../hooks/useProjects';
import { fetchConsultantEarnings } from '../../services/projectService';
import { colors, fonts, fontSizes, spacing, radii } from '../../styles/theme';
import { RemoteAssets } from '../../lib/assets';
import type { Project } from '../../types';
import type { MainTabScreenProps } from '../../types/navigation';

// ─── Figma color tokens ──────────────────────────────────────
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
  const [agreedTerms, setAgreedTerms] = useState<Set<string>>(new Set());
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, thisMonth: 0 });

  // consultant_id in projects = auth user_id
  const consultantUserId = consultantProfile?.user_id ?? profile?.id;

  const { projects, loading, error, refresh, handleAction } = useConsultantProjects(consultantUserId);

  // Separate pending vs active
  const pendingProjects = projects.filter(p => p.status === 'pending');
  const activeProjects = projects.filter(p => p.status !== 'pending' && p.status !== 'rejected' && p.status !== 'cancelled');

  async function onAccept(projectId: string) {
    if (!agreedTerms.has(projectId)) {
      Alert.alert('Terms Required', 'Please agree to the Terms and Conditions first.');
      return;
    }
    const result = await handleAction(projectId, 'accepted');
    if (result.success) {
      Alert.alert('Done', 'Request accepted! The buyer has been notified.');
    } else {
      Alert.alert('Error', result.error ?? 'Something went wrong.');
    }
  }

  async function onReject(projectId: string) {
    Alert.alert('Decline Request', 'Are you sure you want to decline this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline', style: 'destructive', onPress: async () => {
          const result = await handleAction(projectId, 'rejected');
          if (result.success) {
            Alert.alert('Done', 'Request declined.');
          } else {
            Alert.alert('Error', result.error ?? 'Something went wrong.');
          }
        }
      },
    ]);
  }

  function onViewWorkorder(project: Project) {
    navigation.navigate('CreatorWorkorder', { project });
  }

  function toggleTerms(projectId: string) {
    setAgreedTerms(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  function formatAmount(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  // Fetch earnings on mount
  React.useEffect(() => {
    if (!consultantUserId) return;
    fetchConsultantEarnings(consultantUserId)
      .then(setEarnings)
      .catch(e => console.warn('[ConsultantDashboard] earnings error:', e));
  }, [consultantUserId]);

  // ─── Render a pending request card (Figma "Sales Dashboard") ──
  function renderPendingCard({ item }: { item: Project }) {
    const isAgreed = agreedTerms.has(item.id);

    return (
      <View style={styles.requestCard}>
        {/* Card header */}
        <Text style={styles.requestTitle}>Request received{'\n'}for Purchase</Text>

        {/* Artwork detail */}
        <Text style={styles.sectionLabel}>ARTWORK DETAIL</Text>
        <View style={styles.artworkImageContainer}>
          <View style={styles.artworkPlaceholder}>
            <Text style={styles.artworkName}>{item.assignment_type || 'Untitled'}</Text>
            <Text style={styles.artworkCategory}>
              {item.assignment_details?.[0] || 'Creative Work'}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.infoRow}>
          <Truck size={18} color={ORANGE_TITLE} strokeWidth={2} />
          <Text style={styles.infoLabel}>DELIVERY ADDRESS</Text>
        </View>
        <Text style={styles.infoText}>
          {profile?.address || 'Address will be confirmed by buyer'}
        </Text>

        {/* Payment Status */}
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
            <Text style={styles.infoText}>Artwork cost: ({formatCurrency(item.budget)})</Text>
          </View>
          <Text style={styles.paymentNote}>
            Funds will be released upon delivery confirmation.
          </Text>
        </View>

        {/* Terms checkbox */}
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

        {/* Accept / Decline buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.acceptBtn, !isAgreed && { opacity: 0.5 }]}
            onPress={() => onAccept(item.id)}
            disabled={!isAgreed}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptText}>Accept Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => onReject(item.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Render an active project card ────────────────────────────
  function renderActiveCard({ item }: { item: Project }) {
    return (
      <ProjectCard
        project={item}
        onAccept={onAccept}
        onReject={onReject}
        onViewWorkorder={onViewWorkorder}
      />
    );
  }

  // ─── List sections ────────────────────────────────────────────
  type SectionItem = { type: 'header' } | { type: 'active_header' } | { type: 'pending'; project: Project } | { type: 'active'; project: Project } | { type: 'empty' };

  const sections: SectionItem[] = [];
  sections.push({ type: 'header' });

  pendingProjects.forEach(p => sections.push({ type: 'pending', project: p }));

  if (activeProjects.length > 0) {
    sections.push({ type: 'active_header' });
    activeProjects.forEach(p => sections.push({ type: 'active', project: p }));
  }

  if (pendingProjects.length === 0 && activeProjects.length === 0) {
    sections.push({ type: 'empty' });
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
                    <Text style={styles.dashboardTitle}>Creator's{'\n'}Dashboard</Text>
                    
                    {/* Quick Action Grid */}
                    <View style={styles.quickGrid}>
                      <TouchableOpacity style={[styles.quickBtn, styles.quickBtnActive]} activeOpacity={0.8}>
                        <Text style={[styles.quickLabel, styles.quickLabelActive]}>Sales{'\n'}Dashboard</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickBtn} activeOpacity={0.8}>
                        <Text style={styles.quickLabel}>Project{'\n'}Dashboard</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.quickBtn}
                        onPress={() => (navigation as any).navigate('History')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.quickLabel}>Sales{'\n'}History</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickBtn} activeOpacity={0.8}>
                        <Text style={styles.quickLabel}>Manage{'\n'}Projects</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Earnings Summary Card — Figma Sales Dashboard-1 */}
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

                    {error && (
                      <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>⚠ {error}</Text>
                      </View>
                    )}
                  </View>
                );
              }
              if (section.type === 'pending') return renderPendingCard({ item: section.project });
              if (section.type === 'active_header') {
                return (
                  <View style={styles.activeHeader}>
                    <Text style={styles.activeTitle}>Active Projects</Text>
                    <Text style={styles.activeCount}>{activeProjects.length} in progress</Text>
                  </View>
                );
              }
              if (section.type === 'active') return renderActiveCard({ item: section.project });
              if (section.type === 'empty') {
                return (
                  <View style={styles.emptyState}>
                    <FileText size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No requests yet</Text>
                    <Text style={styles.emptySubtitle}>Purchase and project requests will appear here</Text>
                  </View>
                );
              }
              return null;
            }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.primary} />
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

  // ── Header ────────────────────────────────────
  headerSection: { paddingTop: 16, marginBottom: 8 },
  dashboardTitle: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: fonts.heavy,
    color: '#2D8B7F',
    lineHeight: 42,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // ── Quick action grid ─────────────────────────
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

  // ── Error ─────────────────────────────────────
  errorBanner: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 8, padding: 12, marginBottom: 12,
  },
  errorText: { color: '#DC2626', fontSize: 13, fontFamily: fonts.body },

  // ── Request Card (Figma Sales Dashboard) ──────
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

  // ── Artwork ───────────────────────────────────
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
  },
  artworkPlaceholder: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    justifyContent: 'flex-end',
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

  // ── Info rows ─────────────────────────────────
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
  paymentInfo: {
    marginBottom: spacing.lg,
  },
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

  // ── Terms ─────────────────────────────────────
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
  checkboxChecked: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  termsText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    flex: 1,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  // ── Action buttons ────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  acceptBtn: {
    backgroundColor: ACCEPT_BG,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },
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
  declineText: {
    color: DECLINE_COLOR,
    fontSize: fontSizes.base,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },

  // ── Active section ────────────────────────────
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activeCount: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textSecondary,
  },

  // ── Empty state ───────────────────────────────
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
  emptySubtitle: { fontSize: 13, fontFamily: fonts.body, color: '#D1D5DB', textAlign: 'center' },

  // ── Earnings Card (Sales Dashboard-1) ─────────
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
  earningsRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  earningsItem: {
    flex: 1, alignItems: 'center', gap: 4,
  },
  earningsDivider: {
    width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: spacing.md,
  },
  earningsItemLabel: {
    fontSize: fontSizes.xs, fontFamily: fonts.body, color: '#9CA3AF',
  },
  earningsItemValue: {
    fontSize: fontSizes.lg, fontWeight: '700', fontFamily: fonts.heavy, color: '#7DD3C0',
  },
});
