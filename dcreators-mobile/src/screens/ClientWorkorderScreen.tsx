import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../components/TopHeader';
import { ArrowLeft, Eye, MessageCircle, CheckCircle, Circle, Clock, CreditCard } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const MILESTONES = [
  { key: 'pending', label: 'Project Submitted', desc: 'Awaiting consultant response' },
  { key: 'accepted', label: 'Consultant Accepted', desc: 'Ready for advance payment' },
  { key: 'advance_paid', label: 'Advance Paid', desc: 'Work can begin' },
  { key: 'in_progress', label: 'Work In Progress', desc: 'Consultant is working' },
  { key: 'review_1', label: 'Review Round 1', desc: 'First draft submitted' },
  { key: 'review_2', label: 'Review Round 2', desc: 'Revisions submitted' },
  { key: 'final_review', label: 'Final Review', desc: 'Final submission ready' },
  { key: 'approved', label: 'Client Approved', desc: 'Ready for balance payment' },
  { key: 'completed', label: 'Completed', desc: 'Project delivered ✅' },
];

export default function ClientWorkorderScreen({ navigation, route }: any) {
  const project = route?.params?.project;
  const [showMilestones, setShowMilestones] = useState(false);

  const assignmentNo = project
    ? `${project.id.slice(0, 4).toUpperCase()}/${new Date(project.created_at).getMonth() + 1}/${new Date(project.created_at).getFullYear().toString().slice(2)}`
    : '----/--/--';

  const budget = project?.budget ? Number(project.budget) : 0;
  const advance = Math.round(budget * 0.5);
  const status = project?.status || 'pending';
  const progress = project?.progress_percent || 0;

  const isReviewPhase = ['review_1', 'review_2', 'final_review'].includes(status);
  const needsAdvancePayment = status === 'accepted';
  const needsBalancePayment = status === 'approved';

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: colors.warning },
    accepted: { label: 'Accepted', color: colors.success },
    advance_paid: { label: 'Advance Paid', color: colors.info },
    in_progress: { label: 'In Progress', color: '#8B5CF6' },
    review_1: { label: 'Review 1 — Ready', color: '#EC4899' },
    review_2: { label: 'Review 2 — Ready', color: '#EC4899' },
    final_review: { label: 'Final Review — Ready', color: colors.error },
    approved: { label: 'Approved', color: colors.success },
    completed: { label: 'Completed', color: colors.success },
  };

  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.pending;

  // Determine which milestones are completed
  const statusOrder = MILESTONES.map(m => m.key);
  const currentIndex = statusOrder.indexOf(status);

  return (
    <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.bg} imageStyle={{ opacity: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TopHeader />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>

            {/* Back + Title */}
            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ArrowLeft size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Workorder</Text>
              <View style={{ width: 36 }} />
            </View>

            {/* Assignment Number + Status */}
            <View style={styles.headerRow}>
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>No: {assignmentNo}</Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.statusChipText}>{statusInfo.label}</Text>
              </View>
            </View>

            {/* Details Card */}
            <View style={styles.card}>
              <DetailRow label="Assignment Type" value={project?.assignment_type ? project.assignment_type.charAt(0).toUpperCase() + project.assignment_type.slice(1) : 'N/A'} />
              <DetailRow label="Details" value={project?.assignment_details?.join(', ') || 'N/A'} />
              <DetailRow label="Deadline" value={project?.deadline || 'Not set'} />
              <DetailRow label="Brief" value={project?.assignment_brief || 'N/A'} />

              <View style={styles.divider} />

              <DetailRow label="Final Cost" value={`₹${project?.final_offer || budget}`} bold />
              <DetailRow label="Budget" value={`₹${budget.toLocaleString()}`} />
              <DetailRow label="Advance (50%)" value={`₹${advance.toLocaleString()}`} />
            </View>

            {/* Consultant Info */}
            <View style={styles.consultantCard}>
              <Text style={styles.assignedLabel}>Assigned to</Text>
              <Text style={styles.assignedValue}>
                {project?.consultant_profiles?.display_name || 'Consultant'} / {project?.consultant_profiles?.code || '---'}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
            </View>

            {/* Work Progress Toggle Button */}
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setShowMilestones(!showMilestones)}
            >
              <Clock size={16} color={colors.primary} />
              <Text style={styles.toggleBtnText}>
                {showMilestones ? 'Hide Milestones' : 'View Work Progress'}
              </Text>
            </TouchableOpacity>

            {/* Milestone Timeline */}
            {showMilestones && (
              <View style={styles.timelineCard}>
                <Text style={styles.timelineTitle}>Project Milestones</Text>
                {MILESTONES.map((milestone, i) => {
                  const isCompleted = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  const isLast = i === MILESTONES.length - 1;

                  return (
                    <View key={milestone.key} style={styles.milestoneRow}>
                      {/* Vertical line */}
                      <View style={styles.timelineCol}>
                        {isCompleted ? (
                          <CheckCircle size={20} color={isCurrent ? colors.primary : colors.success} />
                        ) : (
                          <Circle size={20} color={colors.borderInput} />
                        )}
                        {!isLast && (
                          <View style={[styles.timelineLine, isCompleted && i < currentIndex && { backgroundColor: colors.success }]} />
                        )}
                      </View>
                      {/* Text */}
                      <View style={styles.milestoneText}>
                        <Text style={[
                          styles.milestoneLabel,
                          isCompleted && { color: colors.textPrimary },
                          isCurrent && { color: colors.primary },
                        ]}>
                          {milestone.label}
                        </Text>
                        <Text style={[styles.milestoneDesc, isCurrent && { color: colors.textSecondary }]}>
                          {milestone.desc}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.actionBar}>
          {isReviewPhase ? (
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => navigation.navigate('ClientReview', { project })}
            >
              <Eye size={18} color={colors.textOnPrimary} />
              <Text style={styles.actionBtnLabel}>Review Submission</Text>
            </TouchableOpacity>
          ) : needsAdvancePayment ? (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => navigation.navigate('Payment', { project, paymentType: 'advance' })}
            >
              <CreditCard size={18} color={colors.textOnPrimary} />
              <Text style={styles.actionBtnLabel}>Pay Advance ₹{advance.toLocaleString()}</Text>
            </TouchableOpacity>
          ) : needsBalancePayment ? (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => navigation.navigate('Payment', { project, paymentType: 'balance' })}
            >
              <CreditCard size={18} color={colors.textOnPrimary} />
              <Text style={styles.actionBtnLabel}>Pay Balance ₹{(budget - advance).toLocaleString()}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate('Chat', { project, otherName: project?.consultant_name || 'Consultant' })}
          >
            <MessageCircle size={16} color={colors.primary} />
            <Text style={styles.chatBtnText}>Chat with Consultant</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 6, flexWrap: 'wrap' }}>
      <Text style={{ fontSize: fontSizes.xs + 1, fontWeight: '700', color: bold ? colors.textPrimary : colors.textSecondary, fontFamily: fonts.medium }}>{label}: </Text>
      <Text style={{ fontSize: fontSizes.xs + 1, color: bold ? colors.textPrimary : colors.textSecondary, fontFamily: bold ? fonts.heavy : fonts.body, flexShrink: 1, fontWeight: bold ? '700' : '400' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: fontSizes.xl, fontFamily: fonts.heavy, color: colors.textPrimary },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  primaryBadge: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.sm },
  primaryBadgeText: { color: colors.textOnPrimary, fontSize: fontSizes.xs + 1, fontWeight: '700', fontFamily: fonts.heavy },
  statusChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.xl },
  statusChipText: { color: colors.textOnPrimary, fontSize: fontSizes.xs, fontWeight: '700', fontFamily: fonts.heavy },

  card: {
    backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1, borderColor: '#E6E6E6',
    borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },

  consultantCard: {
    backgroundColor: colors.sectionBg, borderWidth: 1, borderColor: colors.borderInput,
    padding: spacing.lg, borderRadius: radii.md, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg,
  },
  assignedLabel: { fontSize: fontSizes.sm, color: colors.textSecondary, fontFamily: fonts.medium },
  assignedValue: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.success, fontFamily: fonts.heavy },

  progressSection: { marginBottom: spacing.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy },
  progressPercent: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.success, fontFamily: fonts.heavy },
  progressBarBg: { height: 8, backgroundColor: colors.borderInput, borderRadius: radii.sm, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.success },

  // Toggle button
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: radii.md, marginBottom: spacing.lg,
    borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'rgba(255,255,255,0.6)',
  },
  toggleBtnText: { color: colors.primary, fontSize: fontSizes.sm + 1, fontWeight: '600', fontFamily: fonts.medium },

  // Timeline
  timelineCard: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: '#E6E6E6',
    borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card,
  },
  timelineTitle: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: spacing.lg },
  milestoneRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineCol: { alignItems: 'center', width: 24, marginRight: spacing.md },
  timelineLine: { width: 2, height: 32, backgroundColor: colors.borderInput, marginVertical: 2 },
  milestoneText: { flex: 1, paddingBottom: spacing.md },
  milestoneLabel: { fontSize: fontSizes.sm + 1, fontWeight: '600', fontFamily: fonts.medium, color: colors.textTertiary },
  milestoneDesc: { fontSize: fontSizes.xs + 1, fontFamily: fonts.body, color: colors.textTertiary, marginTop: 1 },

  // Action bar
  actionBar: {
    paddingHorizontal: spacing.xl, paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 14,
    backgroundColor: colors.cardBg, borderTopWidth: 1, borderTopColor: colors.borderCard,
  },
  reviewBtn: {
    backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm,
  },
  payBtn: {
    backgroundColor: colors.success, paddingVertical: 14, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm,
  },
  actionBtnLabel: { color: colors.textOnPrimary, fontSize: fontSizes.md, fontWeight: '700', fontFamily: fonts.heavy },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: radii.md, marginTop: spacing.sm,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  chatBtnText: { color: colors.primary, fontSize: fontSizes.sm + 1, fontWeight: '600', fontFamily: fonts.medium },
});
