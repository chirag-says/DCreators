/**
 * CONSULTANT_PROJECT_COLLABORATION_SCREEN  (Phase 5.4)
 * owner_role: CONSULTANT
 * Figma: CONSULTANT_PROJECT_COLLABORATION_SCREEN.png
 * — "Project Dashboard" — incoming request banner
 * — Project brief, budget, deadline details
 * — Collaboration search (find another consultant to co-work with)
 * — "Collaborate Now" CTA
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Users, BadgeCheck, ChevronRight } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors, fonts, fontSizes, spacing, radii } from '../styles/theme';
import type { Project, ConsultantProfile } from '../types';

const NAVY   = '#1B3A5C';
const TEAL   = '#3D9B8F';
const ORANGE = '#E87B35';
const BROWN  = '#7B3F00';
const BG     = '#EDF1F5';

export default function ConsultantProjectCollaborationScreen({ navigation, route }: any) {
  const project: Project = route?.params?.project;

  const [collaborators, setCollaborators] = useState<ConsultantProfile[]>([]);
  const [loading,        setLoading]       = useState(true);
  const [collab,         setCollab]        = useState<ConsultantProfile | null>(null);

  const deadline    = project?.deadline ? new Date(project.deadline) : null;
  const today       = new Date();
  const daysLeft    = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const deadlineStr = deadline ? deadline.toLocaleDateString('en-IN', { month:'short', day:'numeric', year:'2-digit' }) : '—';

  useEffect(() => { fetchCollaborators(); }, []);

  async function fetchCollaborators() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('consultant_profiles')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      setCollaborators(data ?? []);
      if (data && data.length > 0) setCollab(data[0]);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleCollaborate() {
    if (!collab || !project) return;
    Alert.alert(
      'Initiate Collaboration?',
      `Request ${collab.display_name} to collaborate on this project?`,
      [
        { text: 'Cancel' },
        { text: 'Send Request', onPress: async () => {
          try {
            await supabase.from('collaboration_requests').insert({
              project_id:     project.id,
              requester_id:   project.consultant_id,
              collaborator_id: collab.user_id,
              status:         'pending',
              created_at:     new Date().toISOString(),
            });
            Alert.alert('Request Sent ✅', `${collab.display_name} has been invited to collaborate.`);
          } catch (e: any) { Alert.alert('Error', e.message); }
        }},
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={NAVY} />
        </TouchableOpacity>
        <Text style={s.tagline}>HIRE CREATIVES. BUY ART. BUILD IDEAS</Text>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Notifications')} activeOpacity={0.7}>
          <Bell size={18} color={NAVY} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <Text style={s.heroTitle}>Project{'\n'}Dashboard</Text>

        {/* Incoming request label */}
        {project && (
          <>
            <Text style={s.assignmentLabel}>
              Project Assignment - D/{new Date(project.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'2-digit' }).replace(/\//g,'/')}
            </Text>
            <Text style={s.requestFrom}>
              Incoming Request from "{project.assignment_brief?.slice(0,28) ?? 'Client'}"
            </Text>
          </>
        )}

        {/* Open for collaboration banner */}
        <View style={s.collabBanner}>
          <Text style={s.collabBannerText}>The project is open for Collaboration</Text>
        </View>

        {/* Project details card */}
        {project ? (
          <View style={s.detailCard}>
            <Text style={s.projectBrief}>{project.assignment_brief}</Text>
            <View style={s.divider} />
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>ESTIMATED BUDGET</Text>
              <Text style={s.detailValue}>₹{(project.final_offer ?? project.budget ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>PROJECT DEADLINE</Text>
              <Text style={s.detailDeadline}>
                {deadlineStr}{daysLeft !== null ? ` — (${daysLeft} Days)` : ''}
              </Text>
            </View>
          </View>
        ) : (
          <View style={s.emptyCard}><Text style={s.emptyText}>No project data provided.</Text></View>
        )}

        {/* Collaboration search */}
        <Text style={s.searchLabel}>SEARCH CREATIVE CONSULTANT{'\n'}FOR COLLABORATION</Text>

        {loading ? (
          <ActivityIndicator size="small" color={TEAL} style={{ marginTop: 16 }} />
        ) : (
          <>
            {/* Candidate count pill */}
            <TouchableOpacity style={s.candidateRow} activeOpacity={0.8}>
              <Text style={s.candidateText}>Total Candidates ({collaborators.length})</Text>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            {/* Pick list — show top 3, highlight selected */}
            {collaborators.slice(0, 3).map(c => {
              const isSelected = collab?.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[s.consultantCard, isSelected && s.consultantCardSelected]}
                  onPress={() => setCollab(c)}
                  activeOpacity={0.85}
                >
                  <View style={s.consultantLeft}>
                    {c.avatar_url
                      ? <Image source={{ uri: c.avatar_url }} style={s.consultantAvatar} />
                      : <View style={[s.consultantAvatar, s.consultantAvatarFallback]}>
                          <Text style={s.consultantAvatarInit}>{c.display_name.charAt(0).toUpperCase()}</Text>
                        </View>
                    }
                    <View>
                      <Text style={s.consultantName}>{c.display_name}</Text>
                      <Text style={s.consultantCode}>Code: {c.code}</Text>
                      <View style={s.consultantBadgeRow}>
                        {c.experience && (
                          <View style={s.badge}><Text style={s.badgeText}>{c.experience} Years</Text></View>
                        )}
                        {c.is_approved && (
                          <View style={[s.badge, s.badgeTeal]}>
                            <BadgeCheck size={10} color={TEAL} />
                            <Text style={[s.badgeText, { color: TEAL }]}>Verified Pro</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {isSelected && (
                    <TouchableOpacity
                      style={s.collaborateBtn}
                      onPress={handleCollaborate}
                      activeOpacity={0.85}
                    >
                      <Text style={s.collaborateBtnText}>Collaborate Now</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}

            {collaborators.length > 3 && (
              <TouchableOpacity style={s.showMoreBtn} activeOpacity={0.8}>
                <Users size={16} color={NAVY} />
                <Text style={s.showMoreText}>View all {collaborators.length} candidates</Text>
              </TouchableOpacity>
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  tagline: { fontSize: 9, fontFamily: fonts.body, color: colors.textTertiary, letterSpacing: 0.5 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  heroTitle: { fontSize: 44, fontWeight: '900', fontFamily: fonts.heavy, color: TEAL, lineHeight: 48, marginTop: 12, marginBottom: 12 },
  assignmentLabel: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: ORANGE, marginBottom: 4 },
  requestFrom: { fontSize: fontSizes.sm + 1, fontFamily: fonts.body, color: colors.textSecondary, marginBottom: 14 },
  // Banner
  collabBanner: { backgroundColor: BROWN, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', marginBottom: 20 },
  collabBannerText: { color: '#fff', fontSize: fontSizes.base, fontFamily: fonts.body },
  // Detail card
  detailCard: { backgroundColor: '#FAFAF6', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E9E5D8' },
  projectBrief: { fontSize: fontSizes.xl + 2, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY, lineHeight: 30, marginBottom: 14 },
  divider: { height: 1, backgroundColor: '#E9E5D8', marginBottom: 14 },
  detailRow: { marginBottom: 12 },
  detailLabel: { fontSize: 10, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textTertiary, letterSpacing: 0.8, marginBottom: 4 },
  detailValue: { fontSize: fontSizes['2xl'], fontWeight: '900', fontFamily: fonts.heavy, color: NAVY },
  detailDeadline: { fontSize: fontSizes.xl, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY },
  // Search
  searchLabel: { fontSize: fontSizes.base, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY, lineHeight: 22, marginBottom: 14 },
  candidateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.borderCard },
  candidateText: { flex: 1, fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textPrimary },
  // Consultant card
  consultantCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: colors.borderCard },
  consultantCardSelected: { borderColor: NAVY, backgroundColor: '#F0F2FF' },
  consultantLeft: { gap: 12 },
  consultantAvatar: { width: 56, height: 56, borderRadius: 28 },
  consultantAvatarFallback: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  consultantAvatarInit: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: fonts.heavy },
  consultantName: { fontSize: fontSizes.lg, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY },
  consultantCode: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textSecondary, marginTop: 2 },
  consultantBadgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTeal: { backgroundColor: '#EEF9F8', flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontSize: fontSizes.xs + 1, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textSecondary },
  collaborateBtn: { backgroundColor: NAVY, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  collaborateBtnText: { color: '#fff', fontSize: fontSizes.base, fontWeight: '800', fontFamily: fonts.heavy },
  showMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  showMoreText: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY },
  emptyCard: { backgroundColor: '#fff', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.borderCard },
  emptyText: { fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textTertiary },
});
