// ============================================================
// CollaborationDashboard — Client's Active Project Hub
// ============================================================
// Matches: "Collaboration Deshboard.png"
// Shows project details + budget + deadline + search for consultants
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../components/TopHeader';
import { supabase } from '../lib/supabase';
import { ChevronRight, Users } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';
import type { ConsultantProfile } from '../types';

export default function CollaborationDashboard({ navigation, route }: any) {
  const project = route?.params?.project;
  const [candidates, setCandidates] = useState<ConsultantProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const projectCode = project
    ? `D/${new Date(project.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '/')}`
    : 'D/--/--/--';

  const budget = project?.budget ? Number(project.budget) : 0;
  const deadline = project?.deadline || 'Not set';
  const assignmentType = project?.assignment_type
    ? project.assignment_type.charAt(0).toUpperCase() + project.assignment_type.slice(1).replace(/_/g, ' ')
    : '';

  // Fetch matching consultants
  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('consultant_profiles')
        .select('*')
        .eq('is_active', true)
        .eq('is_approved', true)
        .limit(10);
      if (data) setCandidates(data as ConsultantProfile[]);
    } catch (err) { console.log('[Collab] err:', err); }
    finally { setLoading(false); }
  }

  const deadlineFormatted = (() => {
    if (!project?.deadline) return 'Not set';
    const d = new Date(project.deadline);
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} 26- (${diff} Days)`;
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopHeader />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Project{'\n'}Dashboard</Text>
          <Text style={styles.projectCode}>Project Assignment - {projectCode}</Text>
          <Text style={styles.projectSubtitle}>
            Incoming Request from "{project?.client_name || 'Client'}"
          </Text>
        </View>

        {/* Open for collaboration banner */}
        <View style={styles.collabBanner}>
          <Text style={styles.collabBannerText}>The project is open for Collaboration</Text>
        </View>

        {/* Project info card */}
        <View style={styles.projectCard}>
          <Text style={styles.projectCardTitle}>
            {project?.assignment_details?.[0] || assignmentType || 'Creative Project'}
          </Text>

          <View style={styles.budgetBlock}>
            <Text style={styles.budgetLabel}>ESTIMATED BUDGET</Text>
            <Text style={styles.budgetValue}>₹{budget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.deadlineBlock}>
            <Text style={styles.deadlineLabel}>PROJECT DEADLINE</Text>
            <Text style={styles.deadlineValue}>{deadlineFormatted}</Text>
          </View>
        </View>

        {/* Search Consultants Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>SEARCH CREATIVE CONSULTANT{'\n'}FOR COLLABORATION</Text>

          <TouchableOpacity style={styles.candidateCount}>
            <Text style={styles.candidateCountText}>Total Candidates ({candidates.length})</Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Consultant Cards */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
        ) : (
          candidates.map((c) => {
            const priceVariance = budget > 0 && c.base_price
              ? Math.round(((c.base_price - budget) / budget) * 100)
              : 0;

            return (
              <View key={c.id} style={styles.consultantCard}>
                <View style={styles.consultantHeader}>
                  {c.avatar_url ? (
                    <Image source={{ uri: c.avatar_url }} style={styles.consultantAvatar} />
                  ) : (
                    <View style={[styles.consultantAvatar, styles.consultantAvatarPlaceholder]}>
                      <Users size={20} color={colors.textTertiary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.consultantName}>{c.display_name}</Text>
                    <Text style={styles.consultantCode}>Code: {c.code}</Text>
                  </View>
                </View>

                <View style={styles.consultantTags}>
                  {c.experience && (
                    <View style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{c.experience}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.tagChipOutline}
                    onPress={() => {
                      if (c.portfolio_images?.length) {
                        navigation.navigate('PortfolioGallery', { images: c.portfolio_images });
                      }
                    }}
                  >
                    <Text style={styles.tagChipOutlineText}>View Portfolio</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceValue}>₹{(c.base_price || 0).toLocaleString('en-IN')}</Text>
                  {priceVariance !== 0 && (
                    <Text style={[styles.priceVariance, { color: priceVariance > 0 ? colors.warning : colors.success }]}>
                      {priceVariance > 0 ? '+' : ''}{priceVariance}% OF BUDGET
                    </Text>
                  )}
                  {priceVariance === 0 && <Text style={[styles.priceVariance, { color: colors.success }]}>ON BUDGET</Text>}
                </View>

                <TouchableOpacity
                  style={styles.collaborateBtn}
                  onPress={() => navigation.navigate('FinalizeOffer', { project: { ...project, consultant_id: c.user_id, consultant_profiles: c } })}
                >
                  <Text style={styles.collaborateBtnText}>Collaborate Now</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.bottomBtnText}>← BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomHomeBtn} onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}>
          <Text style={styles.bottomHomeBtnText}>HOME DASHBOARD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomSearchBtn} onPress={() => navigation.navigate('Main', { screen: 'Search' })}>
          <Text style={styles.bottomBtnText}>🔍 SEARCH</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { paddingBottom: 100 },

  headerSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  headerTitle: { fontSize: fontSizes['4xl'], fontWeight: '800', fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: spacing.sm },
  projectCode: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: colors.orange, marginBottom: spacing.xs },
  projectSubtitle: { fontSize: fontSizes.sm + 1, fontFamily: fonts.body, color: colors.textSecondary },

  collabBanner: { marginHorizontal: spacing.xl, backgroundColor: '#1A365D', paddingVertical: 16, paddingHorizontal: spacing.xl, borderRadius: radii.lg, marginBottom: spacing.xl, alignItems: 'center' },
  collabBannerText: { color: colors.textOnPrimary, fontSize: fontSizes.base, fontWeight: '600', fontFamily: fonts.medium, textAlign: 'center' },

  projectCard: { marginHorizontal: spacing.xl, backgroundColor: colors.cardBg, borderRadius: radii.lg, padding: spacing.xl, marginBottom: spacing.xl, borderWidth: 2, borderColor: '#1A365D', ...shadows.card },
  projectCardTitle: { fontSize: fontSizes['2xl'], fontWeight: '700', fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: spacing.xl },

  budgetBlock: { backgroundColor: '#F7F8FA', borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.md },
  budgetLabel: { fontSize: fontSizes.xs + 1, fontWeight: '600', fontFamily: fonts.medium, color: colors.textTertiary, letterSpacing: 0.5, marginBottom: spacing.xs },
  budgetValue: { fontSize: fontSizes['3xl'], fontWeight: '800', fontFamily: fonts.heavy, color: colors.textPrimary },

  deadlineBlock: { backgroundColor: '#F7F8FA', borderRadius: radii.md, padding: spacing.lg },
  deadlineLabel: { fontSize: fontSizes.xs + 1, fontWeight: '600', fontFamily: fonts.medium, color: colors.textTertiary, letterSpacing: 0.5, marginBottom: spacing.xs },
  deadlineValue: { fontSize: fontSizes.xl, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textPrimary },

  searchSection: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  searchTitle: { fontSize: fontSizes.base, fontWeight: '800', fontFamily: fonts.heavy, color: colors.textPrimary, letterSpacing: 0.3, marginBottom: spacing.lg },

  candidateCount: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  candidateCountText: { fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textPrimary },

  consultantCard: { marginHorizontal: spacing.xl, backgroundColor: colors.cardBg, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1.5, borderColor: '#1A365D', ...shadows.card },
  consultantHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  consultantAvatar: { width: 54, height: 54, borderRadius: 27 },
  consultantAvatarPlaceholder: { backgroundColor: colors.sectionBg, alignItems: 'center', justifyContent: 'center' },
  consultantName: { fontSize: fontSizes.lg, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textPrimary },
  consultantCode: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textSecondary },

  consultantTags: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tagChip: { backgroundColor: '#F0F4F8', paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radii.xl },
  tagChipText: { fontSize: fontSizes.xs + 1, fontFamily: fonts.medium, color: colors.textSecondary },
  tagChipOutline: { borderWidth: 1, borderColor: colors.primary, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radii.xl },
  tagChipOutlineText: { fontSize: fontSizes.xs + 1, fontFamily: fonts.medium, color: colors.primary },

  priceRow: { marginBottom: spacing.md },
  priceValue: { fontSize: fontSizes.xl, fontWeight: '800', fontFamily: fonts.heavy, color: colors.textPrimary },
  priceVariance: { fontSize: fontSizes.xs + 1, fontWeight: '700', fontFamily: fonts.heavy, marginTop: 2 },

  collaborateBtn: { backgroundColor: '#1A365D', paddingVertical: 14, borderRadius: radii.lg, alignItems: 'center', alignSelf: 'flex-end', paddingHorizontal: spacing['3xl'] },
  collaborateBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.sm + 1, fontWeight: '700', fontFamily: fonts.heavy },

  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: Platform.OS === 'ios' ? 30 : spacing.md, backgroundColor: colors.cardBg, borderTopWidth: 1, borderTopColor: colors.borderCard },
  bottomBackBtn: { paddingVertical: spacing.sm },
  bottomBtnText: { fontSize: fontSizes.xs + 1, fontFamily: fonts.medium, color: colors.textSecondary },
  bottomHomeBtn: { backgroundColor: '#1A365D', paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radii.lg },
  bottomHomeBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.xs + 1, fontWeight: '700', fontFamily: fonts.heavy },
  bottomSearchBtn: { paddingVertical: spacing.sm },
});
