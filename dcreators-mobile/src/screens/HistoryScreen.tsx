import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../components/TopHeader';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { FileText, Clock, CheckCircle, XCircle, CreditCard, AlertCircle, ChevronRight } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: colors.warning, icon: Clock },
  accepted: { label: 'Accepted', color: colors.success, icon: CheckCircle },
  advance_paid: { label: 'Advance Paid', color: colors.info, icon: CreditCard },
  in_progress: { label: 'In Progress', color: '#8B5CF6', icon: Clock },
  review_1: { label: 'Review 1', color: '#EC4899', icon: AlertCircle },
  review_2: { label: 'Review 2', color: '#EC4899', icon: AlertCircle },
  final_review: { label: 'Final Review', color: colors.error, icon: AlertCircle },
  approved: { label: 'Approved', color: colors.success, icon: CheckCircle },
  completed: { label: 'Completed', color: colors.success, icon: CheckCircle },
  rejected: { label: 'Rejected', color: colors.error, icon: XCircle },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function HistoryScreen({ navigation }: any) {
  const profile = useAuthStore((s) => s.profile);
  const currentRole = useAuthStore((s) => s.currentRole);
  const consultantProfile = useAuthStore((s) => s.consultantProfile);

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, [profile?.id, currentRole]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, [profile?.id, currentRole]);

  async function fetchProjects() {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentRole === 'consultant' && consultantProfile?.id) {
        query = query.eq('consultant_id', consultantProfile.id);
      } else {
        query = query.eq('client_id', profile.id);
      }

      const { data, error } = await query;
      if (error) {
        console.log('History fetch error:', error.message);
      }
      setProjects(data || []);
    } catch (err: any) {
      console.log('History fetch exception:', err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  // Filter projects by tab
  const ACTIVE_STATUSES = ['pending', 'accepted', 'advance_paid', 'in_progress', 'review_1', 'review_2', 'final_review', 'approved'];
  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'active') return ACTIVE_STATUSES.includes(p.status);
    if (activeTab === 'completed') return p.status === 'completed';
    return true;
  });

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function handleProjectPress(project: any) {
    if (currentRole === 'consultant') {
      navigation.navigate('CreatorWorkorder', { project });
    } else {
      navigation.navigate('ClientWorkorder', { project });
    }
  }

  return (
    <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.bg} imageStyle={{ opacity: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TopHeader />

        {/* Title + Tabs */}
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>
            {currentRole === 'consultant' ? 'My Orders' : 'My Projects'}
          </Text>
          <View style={styles.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.centerBox}>
            <FileText size={48} color={colors.borderInput} />
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptyDesc}>
              {currentRole === 'consultant'
                ? 'Projects assigned to you will appear here.'
                : 'Assign a project to a creator to get started.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          >
            {filteredProjects.map((project) => {
              const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              const budget = project.budget ? Number(project.budget) : 0;
              const progress = project.progress_percent || 0;
              const consultantName = project.consultant_name || 'Unassigned';
              const consultantCode = '';

              return (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => handleProjectPress(project)}
                  activeOpacity={0.7}
                >
                  {/* Top Row: Type + Status */}
                  <View style={styles.cardTopRow}>
                    <Text style={styles.projectType}>
                      {project.assignment_type
                        ? project.assignment_type.charAt(0).toUpperCase() + project.assignment_type.slice(1)
                        : 'Project'}
                    </Text>
                    <View style={[styles.statusChip, { backgroundColor: statusCfg.color }]}>
                      <StatusIcon size={12} color="#FFF" />
                      <Text style={styles.statusChipText}>{statusCfg.label}</Text>
                    </View>
                  </View>

                  {/* Brief */}
                  <Text style={styles.briefText} numberOfLines={2}>
                    {project.assignment_brief || 'No description'}
                  </Text>

                  {/* Consultant + Budget Row */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>
                        {currentRole === 'consultant' ? 'Client' : 'Consultant'}
                      </Text>
                      <Text style={styles.infoValue}>
                        {currentRole === 'consultant'
                          ? 'Client'
                          : `${consultantName}${consultantCode ? ` / ${consultantCode}` : ''}`}
                      </Text>
                    </View>
                    <View style={[styles.infoItem, { alignItems: 'flex-end' }]}>
                      <Text style={styles.infoLabel}>Budget</Text>
                      <Text style={styles.infoValue}>₹{budget.toLocaleString()}</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  {progress > 0 && (
                    <View style={styles.progressWrap}>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: statusCfg.color }]} />
                      </View>
                      <Text style={styles.progressText}>{progress}%</Text>
                    </View>
                  )}

                  {/* Date + Arrow */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>{formatDate(project.created_at)}</Text>
                    <ChevronRight size={18} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },

  headerSection: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  screenTitle: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.primary, fontFamily: fonts.heavy, marginBottom: spacing.md },

  tabRow: { flexDirection: 'row', gap: spacing.sm },
  tab: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    borderRadius: radii.xl, backgroundColor: colors.sectionBg,
    borderWidth: 1, borderColor: colors.borderInput,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary, fontFamily: fonts.medium },
  tabTextActive: { color: colors.textOnPrimary },

  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: 100 },
  emptyTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy },
  emptyDesc: { fontSize: fontSizes.sm + 1, color: colors.textSecondary, fontFamily: fonts.body, textAlign: 'center', paddingHorizontal: spacing['3xl'] },

  // Project Card
  projectCard: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: '#E6E6E6',
    borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.card,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  projectType: { fontSize: fontSizes.base, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 3, paddingHorizontal: spacing.sm, borderRadius: radii.xl,
  },
  statusChipText: { color: '#FFF', fontSize: fontSizes.xs, fontWeight: '700', fontFamily: fonts.heavy },

  briefText: { fontSize: fontSizes.sm + 1, color: colors.textSecondary, fontFamily: fonts.body, lineHeight: 20, marginBottom: spacing.md },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  infoItem: {},
  infoLabel: { fontSize: fontSizes.xs + 1, color: colors.textTertiary, fontFamily: fonts.body },
  infoValue: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary, fontFamily: fonts.medium, marginTop: 1 },

  // Progress
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  progressBarBg: { flex: 1, height: 6, backgroundColor: colors.borderInput, borderRadius: radii.sm, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: radii.sm },
  progressText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary, fontFamily: fonts.heavy, width: 32, textAlign: 'right' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  dateText: { fontSize: fontSizes.xs + 1, color: colors.textTertiary, fontFamily: fonts.body },
});
