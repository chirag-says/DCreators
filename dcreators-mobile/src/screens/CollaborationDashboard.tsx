/**
 * CONSULTANT_NEGOTIATION_SCREEN (CollaborationDashboard)
 *
 * owner_role: CONSULTANT
 * previous_screen: CONSULTANT_PROJECT_COLLABORATION_SCREEN
 * next_screen: CLIENT_ADVANCE_PAYMENT_SCREEN (after offer accepted)
 * workflow_stage: assigned → advance_pending
 *
 * Figma: CONSULTANT_NEGOTIATION_SCREEN.png
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Download, Upload, CloudUpload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';
import { colors, fonts, fontSizes, spacing, radii } from '../styles/theme';
import { RemoteAssets } from '../lib/assets';
import { Image } from 'react-native';
import type { Submission } from '../types';

const NAVY = '#1B3A5C';
const TEAL = '#0D7F7A';
const ORANGE = '#E87B35';

// Stages where negotiation input is shown
const NEGOTIATION_STAGES = ['assigned', 'advance_pending'];
// Stages where upload section is active
const UPLOAD_STAGES = ['in_progress', 'review_1', 'review_2', 'final_review'];

export default function CollaborationDashboard({ navigation, route }: any) {
  const project = route?.params?.project;
  const status: string = project?.status || 'assigned';

  const budget = project?.budget ? Number(project.budget) : 0;
  const projectCode = project
    ? `D/${new Date(project.created_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: '2-digit',
      }).replace(/\//g, '/')}`
    : 'D/--/--/--';

  const deadlineFormatted = (() => {
    if (!project?.deadline) return 'Not set';
    const d = new Date(project.deadline);
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
    return `${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} ${new Date().getFullYear()} — (${Math.max(0, diff)} Days)`;
  })();

  // Negotiation form state
  const [proposedAmount, setProposedAmount] = useState(
    project?.final_offer ? String(project.final_offer) : '',
  );
  const [proposedDeadline, setProposedDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Upload state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [uploadNote, setUploadNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!project?.id || !UPLOAD_STAGES.includes(status)) return;
    setLoadingSubs(true);
    try {
      const { data } = await supabase
        .from('submissions').select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });
      if (data) setSubmissions(data as Submission[]);
    } finally { setLoadingSubs(false); }
  }, [project?.id, status]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const round1 = submissions.find(s => s.round === 'review_1');
  const round2 = submissions.find(s => s.round === 'review_2');
  const roundFinal = submissions.find(s => s.round === 'final');

  const nextUploadRound: 'review_1' | 'review_2' | 'final' | null = (() => {
    if (!round1) return 'review_1';
    if (round1.client_action === 'revert' && !round2) return 'review_2';
    if (round2?.client_action === 'revert' && !roundFinal) return 'final';
    return null;
  })();

  // ── Submit negotiation offer ──────────────────────────────
  async function handleSubmitOffer() {
    const amount = parseFloat(proposedAmount.replace(/[^0-9.]/g, ''));
    if (!amount || amount <= 0) {
      Alert.alert('Invalid', 'Enter a valid proposed amount.'); return;
    }
    if (!project?.id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('projects').update({
        final_offer: amount,
        status: 'advance_pending',
        updated_at: new Date().toISOString(),
      }).eq('id', project.id);
      if (error) { Alert.alert('Error', error.message); return; }
      if (project.client_id) {
        sendNotification({
          userId: project.client_id,
          title: 'Consultant Offer Received',
          message: `Your consultant has submitted an offer of ₹${amount.toLocaleString('en-IN')}. Please review and pay the advance.`,
          type: 'assignment',
        });
      }
      Alert.alert('Offer Submitted ✅', `Your offer of ₹${amount.toLocaleString('en-IN')} has been sent. Waiting for client advance payment.`, [
        { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Dashboard' }) },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally { setSubmitting(false); }
  }

  // ── Upload design files ───────────────────────────────────
  async function pickImage() {
    if (uploadFiles.length >= 3) { Alert.alert('Limit', 'Max 3 files per round.'); return; }
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted') { Alert.alert('Permission needed'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      setUploadFiles(prev => [...prev, result.assets[0].uri]);
    }
  }

  async function uploadToCloud(localUri: string): Promise<string> {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    if (!cloudName) return localUri;
    try {
      const formData = new FormData();
      const filename = localUri.split('/').pop() || 'design.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('file', { uri: localUri, name: filename, type } as any);
      formData.append('upload_preset', 'dcreators_unsigned');
      formData.append('folder', 'dcreators/submissions');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      return data.secure_url || localUri;
    } catch { return localUri; }
  }

  async function handleSubmitDesign() {
    if (!project?.id || !nextUploadRound) return;
    if (uploadFiles.length === 0) { Alert.alert('No files', 'Add at least one design image.'); return; }
    setIsUploading(true);
    try {
      const urls = await Promise.all(uploadFiles.map(uri => uploadToCloud(uri)));
      const { error } = await supabase.from('submissions').insert({
        project_id: project.id,
        round: nextUploadRound,
        files: urls,
        consultant_note: uploadNote || null,
      });
      if (error) { Alert.alert('Error', error.message); return; }
      const statusMap: Record<string, string> = {
        review_1: 'review_1', review_2: 'review_2', final: 'final_review',
      };
      await supabase.from('projects').update({
        status: statusMap[nextUploadRound],
        progress_percent: nextUploadRound === 'review_1' ? 33 : nextUploadRound === 'review_2' ? 66 : 90,
        updated_at: new Date().toISOString(),
      }).eq('id', project.id);
      if (project.client_id) {
        sendNotification({
          userId: project.client_id,
          title: 'Design Ready for Review',
          message: `Your consultant submitted ${nextUploadRound === 'final' ? 'the final' : 'a'} design for review.`,
          type: 'review',
        });
      }
      Alert.alert('✅ Submitted!', 'Design sent to client.');
      setUploadFiles([]); setUploadNote('');
      fetchSubmissions();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setIsUploading(false); }
  }

  const roundLabel = nextUploadRound === 'review_1' ? '1st' : nextUploadRound === 'review_2' ? '2nd' : 'Final';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={NAVY} />
          </TouchableOpacity>
          <Image source={{ uri: RemoteAssets.dIcon }} style={styles.dIcon} resizeMode="contain" />
          <Text style={styles.headerTagline}>HIRE CREATIVES. BUY ART. BUILD IDEAS</Text>
        </View>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.pageTitle}>Project{'\n'}Dashboard</Text>
          <Text style={styles.projectCode}>Project Assignment - {projectCode}</Text>
          <Text style={styles.projectSubtitle}>Incoming Request from "{project?.client_name || 'Client'}"</Text>
        </View>

        {/* Negotiation banner */}
        {NEGOTIATION_STAGES.includes(status) && (
          <View style={styles.negotiationBanner}>
            <Text style={styles.negotiationBannerText}>
              The project is open for Negotiation in{'\n'}Project Cost and Project Deadline
            </Text>
          </View>
        )}

        {/* Project info card */}
        <View style={styles.projectCard}>
          <Text style={styles.projectCardTitle}>
            {project?.assignment_details?.[0] || project?.assignment_type || 'Creative Project'}
          </Text>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>ESTIMATED BUDGET</Text>
            <Text style={styles.infoValue}>₹{budget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>PROJECT DEADLINE</Text>
            <Text style={styles.infoValueBold}>{deadlineFormatted}</Text>
          </View>
          {project?.assignment_brief ? (
            <View style={[styles.infoBlock, { marginTop: 4 }]}>
              <Text style={styles.infoLabel}>ASSIGNMENT BRIEF</Text>
              <Text style={styles.briefText}>{project.assignment_brief}</Text>
            </View>
          ) : null}
        </View>

        {/* ── NEGOTIATION FORM ─────────────────────────────── */}
        {NEGOTIATION_STAGES.includes(status) && (
          <View style={styles.negotiationCard}>
            <Text style={styles.sectionLabel}>Negotiable amount</Text>
            <View style={styles.amountInput}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.amountInputField}
                placeholder="Enter your proposed amount"
                placeholderTextColor={colors.textTertiary}
                value={proposedAmount}
                onChangeText={setProposedAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Suggested Deadline</Text>
            <TextInput
              style={styles.deadlineInput}
              placeholder="00/00/2026 — Day — 00"
              placeholderTextColor={colors.textTertiary}
              value={proposedDeadline}
              onChangeText={setProposedDeadline}
            />

            <TouchableOpacity
              style={[styles.submitOfferBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmitOffer}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitOfferBtnText}>Submit Offer</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* ── WORK ORDER / UPLOAD SECTION ───────────────────── */}
        {UPLOAD_STAGES.includes(status) && (
          <>
            {/* Download work order */}
            <TouchableOpacity
              style={styles.downloadWOBtn}
              onPress={() => navigation.navigate('CreatorWorkorder', { project })}
              activeOpacity={0.8}
            >
              <Download size={18} color={NAVY} />
              <Text style={styles.downloadWOText}>Download work order</Text>
            </TouchableOpacity>

            {/* Upload hint */}
            <View style={styles.uploadHint}>
              <Text style={styles.uploadHintText}>ⓘ  Upload up to 3 variations for client review.</Text>
            </View>

            {/* Upload drop zone */}
            {nextUploadRound && (
              <View style={styles.uploadCard}>
                <TouchableOpacity style={styles.uploadDropZone} onPress={pickImage} activeOpacity={0.7}>
                  <CloudUpload size={36} color={colors.textTertiary} />
                  <Text style={styles.uploadTitle}>Upload Designs for {roundLabel} Review</Text>
                  <Text style={styles.uploadSubtitle}>Drag & drop or click to browse</Text>
                </TouchableOpacity>

                {/* Thumbnails */}
                {uploadFiles.length > 0 && (
                  <View style={styles.thumbnailRow}>
                    {uploadFiles.map((uri, i) => (
                      <View key={i} style={styles.thumbnail}>
                        <Image source={{ uri }} style={styles.thumbnailImg} />
                        <TouchableOpacity
                          style={styles.thumbnailRemove}
                          onPress={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <Text style={styles.thumbnailRemoveText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {uploadFiles.length < 3 && (
                      <TouchableOpacity style={styles.thumbnailAdd} onPress={pickImage}>
                        <Upload size={20} color={colors.textTertiary} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.submitReviewBtn, (isUploading || uploadFiles.length === 0) && { opacity: 0.5 }]}
                  onPress={handleSubmitDesign}
                  disabled={isUploading || uploadFiles.length === 0}
                  activeOpacity={0.85}
                >
                  {isUploading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <>
                        <CloudUpload size={16} color="#fff" />
                        <Text style={styles.submitReviewBtnText}>Submit for {roundLabel} review</Text>
                      </>
                  }
                </TouchableOpacity>
              </View>
            )}

            {/* All rounds submitted */}
            {!nextUploadRound && (
              <View style={styles.allDoneCard}>
                <Text style={styles.allDoneText}>✅ All 3 review rounds submitted. Awaiting final client approval.</Text>
              </View>
            )}
          </>
        )}

      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.bottomBtnLabel}>← BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomHomeBtn} onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}>
          <Text style={styles.bottomHomeBtnLabel}>⊞  HOME DASHBOARD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.navigate('Main', { screen: 'Search' })}>
          <Text style={styles.bottomBtnLabel}>🔍 SEARCH</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F2F8' },
  scroll: { paddingBottom: 20 },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }, android: { elevation: 2 } }) },
  dIcon: { width: 32, height: 32 },
  headerTagline: { flex: 1, fontSize: 9, fontFamily: fonts.body, color: colors.textSecondary, letterSpacing: 0.5 },

  titleBlock: { paddingHorizontal: 20, paddingBottom: 16 },
  pageTitle: { fontSize: 36, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY, lineHeight: 42, marginBottom: 6 },
  projectCode: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: ORANGE, marginBottom: 4 },
  projectSubtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textSecondary },

  negotiationBanner: { marginHorizontal: 20, backgroundColor: '#5C2E00', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20, marginBottom: 16, alignItems: 'center' },
  negotiationBannerText: { color: '#fff', fontSize: fontSizes.base, fontWeight: '600', fontFamily: fonts.medium, textAlign: 'center', lineHeight: 22 },

  projectCard: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: NAVY, ...Platform.select({ ios: { shadowColor: NAVY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 3 } }) },
  projectCardTitle: { fontSize: 22, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: 16, lineHeight: 30 },
  infoBlock: { backgroundColor: '#F7F8FA', borderRadius: 10, padding: 14, marginBottom: 10 },
  infoLabel: { fontSize: 11, fontWeight: '600', fontFamily: fonts.medium, color: colors.textTertiary, letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 28, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY },
  infoValueBold: { fontSize: 18, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY },
  briefText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textSecondary, lineHeight: 20 },

  negotiationCard: { marginHorizontal: 20, backgroundColor: '#EEF4FF', borderRadius: 16, padding: 20, marginBottom: 16 },
  sectionLabel: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY, marginBottom: 10 },
  amountInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: colors.borderInput, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 4 },
  rupeeSymbol: { fontSize: fontSizes.lg, fontWeight: '700', color: NAVY, marginRight: 8 },
  amountInputField: { flex: 1, fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textPrimary },
  deadlineInput: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: colors.borderInput, paddingHorizontal: 14, paddingVertical: 12, fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textPrimary, marginBottom: 20 },
  submitOfferBtn: { backgroundColor: NAVY, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitOfferBtnText: { color: '#fff', fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, letterSpacing: 0.3 },

  downloadWOBtn: { marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: NAVY, borderRadius: 12, paddingVertical: 16, marginBottom: 12, backgroundColor: '#fff' },
  downloadWOText: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY },
  uploadHint: { marginHorizontal: 20, backgroundColor: '#EEF4FF', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  uploadHintText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textSecondary },

  uploadCard: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.borderInput, marginBottom: 16 },
  uploadDropZone: { borderWidth: 1.5, borderColor: colors.borderInput, borderRadius: 12, borderStyle: 'dashed', alignItems: 'center', paddingVertical: 28, gap: 8, marginBottom: 16 },
  uploadTitle: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textPrimary },
  uploadSubtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textSecondary },

  thumbnailRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  thumbnail: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumbnailImg: { width: 80, height: 80 },
  thumbnailRemove: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.55)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  thumbnailRemoveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  thumbnailAdd: { width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderInput, alignItems: 'center', justifyContent: 'center' },

  submitReviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: TEAL, borderRadius: 12, paddingVertical: 16 },
  submitReviewBtnText: { color: '#fff', fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy },

  allDoneCard: { marginHorizontal: 20, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#86EFAC', marginBottom: 16 },
  allDoneText: { fontSize: fontSizes.base, fontFamily: fonts.medium, color: '#166534', textAlign: 'center' },

  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.borderCard },
  bottomBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  bottomBtnLabel: { fontSize: 10, fontFamily: fonts.medium, color: colors.textSecondary },
  bottomHomeBtn: { backgroundColor: NAVY, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  bottomHomeBtnLabel: { color: '#fff', fontSize: 11, fontWeight: '700', fontFamily: fonts.heavy },
});
