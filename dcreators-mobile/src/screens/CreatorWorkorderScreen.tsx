import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../components/TopHeader';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';
import * as ImagePicker from 'expo-image-picker';
import { X, ImagePlus, Upload, MessageCircle } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

export default function CreatorWorkorderScreen({ navigation, route }: any) {
  const project = route?.params?.project;

  const [milestone1, setMilestone1] = useState(project?.milestone_1_date || '');
  const [milestone2, setMilestone2] = useState(project?.milestone_2_date || '');
  const [finalDate, setFinalDate] = useState(project?.final_date || '');
  const [finalOffer, setFinalOffer] = useState(project?.final_offer ? String(project.final_offer) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [uploadNote, setUploadNote] = useState('');
  const [selectedRound, setSelectedRound] = useState<'review_1' | 'review_2' | 'final'>('review_1');
  const [isUploading, setIsUploading] = useState(false);

  const assignmentNo = project
    ? `${project.id.slice(0, 4).toUpperCase()}/${new Date(project.created_at).getMonth() + 1}/${new Date(project.created_at).getFullYear().toString().slice(2)}`
    : '----/--/--';

  const status = project?.status || 'pending';
  const isAccepted = status !== 'pending';
  const budget = project?.budget ? Number(project.budget) : 0;
  const advance = Math.round(budget * 0.5);

  async function handleAccept() {
    if (!project?.id) return;
    try {
      const { error } = await supabase.from('projects').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', project.id);
      if (error) { Alert.alert('Error', error.message); return; }
      Alert.alert('Accepted!', 'You can now set your timeline.');
      navigation.goBack();
    } catch { Alert.alert('Error', 'Something went wrong.'); }
  }

  async function handleSubmitTimeline() {
    if (!project?.id) return;
    setIsSubmitting(true);
    try {
      const updates: any = { updated_at: new Date().toISOString() };
      if (milestone1) updates.milestone_1_date = milestone1;
      if (milestone2) updates.milestone_2_date = milestone2;
      if (finalDate) updates.final_date = finalDate;
      if (finalOffer) updates.final_offer = parseFloat(finalOffer);
      if (status === 'accepted') updates.status = 'in_progress';
      const { error } = await supabase.from('projects').update(updates).eq('id', project.id);
      if (error) { Alert.alert('Error', error.message); return; }
      Alert.alert('✅ Timeline Saved', 'Your milestones have been recorded.');
      navigation.goBack();
    } catch { Alert.alert('Error', 'Something went wrong.'); }
    finally { setIsSubmitting(false); }
  }

  // ---- Upload Design Logic ----
  async function pickUploadImage() {
    if (uploadFiles.length >= 3) {
      Alert.alert('Limit', 'You can upload up to 3 design files per submission.');
      return;
    }
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted') { Alert.alert('Permission needed', 'Allow photo library access.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      setUploadFiles(prev => [...prev, result.assets[0].uri]);
    }
  }

  function removeUploadFile(index: number) {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmitDesign() {
    if (!project?.id) return;
    if (uploadFiles.length === 0) { Alert.alert('No files', 'Please add at least one design image.'); return; }

    setIsUploading(true);
    try {
      // Insert submission record
      const { error } = await supabase.from('submissions').insert({
        project_id: project.id,
        round: selectedRound,
        files: uploadFiles,
        consultant_note: uploadNote || null,
      });

      if (error) { Alert.alert('Error', error.message); setIsUploading(false); return; }

      // Update project status to match the round
      const statusMap: Record<string, string> = { review_1: 'review_1', review_2: 'review_2', final: 'final_review' };
      await supabase.from('projects').update({
        status: statusMap[selectedRound],
        progress_percent: selectedRound === 'review_1' ? 33 : selectedRound === 'review_2' ? 66 : 90,
        updated_at: new Date().toISOString(),
      }).eq('id', project.id);

      Alert.alert('✅ Design Submitted!', `Your ${selectedRound.replace('_', ' ')} submission has been sent to the client for review.`);

      // Notify client
      if (project.client_id) {
        sendNotification({
          userId: project.client_id,
          title: 'Design Ready for Review',
          message: `Your consultant has submitted ${selectedRound === 'final' ? 'the final' : 'a'} design for review.`,
          type: 'review',
        });
      }

      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadNote('');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally { setIsUploading(false); }
  }

  const ROUND_OPTIONS = [
    { key: 'review_1' as const, label: 'Review 1 (First Draft)' },
    { key: 'review_2' as const, label: 'Review 2 (Revised)' },
    { key: 'final' as const, label: 'Final Submission' },
  ];

  return (
    <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.backgroundImage} imageStyle={{ opacity: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TopHeader />
        
        <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>Assignment No : {assignmentNo}</Text>
              {!isAccepted && (
                <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              )}
              {isAccepted && (
                <View style={[styles.acceptBtn, { backgroundColor: colors.success }]}>
                  <Text style={styles.acceptBtnText}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</Text>
                </View>
              )}
            </View>

            <View style={styles.titleBox}>
              <Text style={styles.titleText}>Workorder Generated</Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assignment Type : </Text>
                <Text style={styles.detailValue}>{project?.assignment_type ? project.assignment_type.charAt(0).toUpperCase() + project.assignment_type.slice(1) : 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assignment Details: </Text>
                <Text style={styles.detailValue}>{project?.assignment_details?.join(', ') || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assignment Deadline: </Text>
                <Text style={styles.detailValue}>{project?.deadline || 'Not set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assignment Brief: </Text>
                <Text style={styles.detailValue}>{project?.assignment_brief || 'N/A'}</Text>
              </View>

              <View style={styles.timelineBox}>
                <Text style={styles.timelineTitle}>Set Your Timeline</Text>
                <View style={styles.timelineRow}>
                  <Text style={styles.timelineBullet}>{'> '}First review - </Text>
                  <TextInput style={styles.timelineInput} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} value={milestone1} onChangeText={setMilestone1} />
                </View>
                <View style={styles.timelineRow}>
                  <Text style={styles.timelineBullet}>{'> '}Second review - </Text>
                  <TextInput style={styles.timelineInput} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} value={milestone2} onChangeText={setMilestone2} />
                </View>
                <View style={styles.timelineRow}>
                  <Text style={styles.timelineBullet}>{'> '}Final review - </Text>
                  <TextInput style={styles.timelineInput} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} value={finalDate} onChangeText={setFinalDate} />
                </View>
              </View>

              <View style={[styles.detailRow, { marginTop: spacing.lg }]}>
                <Text style={styles.detailLabelDark}>Final Assignment Cost: </Text>
                <TextInput style={[styles.detailValueDark, { borderBottomWidth: 1, borderBottomColor: colors.textPrimary, minWidth: 80, paddingVertical: 2 }]} value={finalOffer} onChangeText={setFinalOffer} placeholder={`${budget}`} placeholderTextColor={colors.textTertiary} keyboardType="number-pad" />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabelDark}>Budget: </Text>
                <Text style={styles.detailValueDark}>₹{budget.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabelDark}>Advance (50%): </Text>
                <Text style={styles.detailValueDark}>₹{advance.toLocaleString()}</Text>
              </View>
            </View>

            {/* Status Section */}
            <View style={styles.statusSection}>
              <Text style={styles.statusLabel}>Assignment Status</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${project?.progress_percent || 0}%` }]} />
              </View>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.primary }]} onPress={() => setShowUploadModal(true)}>
                  <Upload size={14} color={colors.textOnPrimary} />
                  <Text style={styles.uploadBtnText}>Upload Design</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.queryBtn} onPress={() => navigation.navigate('Chat', { project, otherName: 'Client' })}>
                  <MessageCircle size={14} color={colors.textOnPrimary} />
                  <Text style={styles.queryBtnText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>

        {isAccepted && (
          <View style={styles.submitBar}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitTimeline} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color={colors.textOnPrimary} size="small" /> : <Text style={styles.submitBtnText}>Save Timeline & Offer</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Upload Design Modal */}
        <Modal visible={showUploadModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Submit Design</Text>
                <TouchableOpacity onPress={() => setShowUploadModal(false)}><X size={22} color={colors.textSecondary} /></TouchableOpacity>
              </View>

              {/* Round picker */}
              <Text style={styles.modalLabel}>Submission Round</Text>
              <View style={styles.roundRow}>
                {ROUND_OPTIONS.map(opt => (
                  <TouchableOpacity key={opt.key} style={[styles.roundChip, selectedRound === opt.key && styles.roundChipActive]} onPress={() => setSelectedRound(opt.key)}>
                    <Text style={[styles.roundChipText, selectedRound === opt.key && styles.roundChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* File picker */}
              <Text style={styles.modalLabel}>Design Files ({uploadFiles.length}/3)</Text>
              <View style={styles.fileGrid}>
                {uploadFiles.map((uri, i) => (
                  <View key={i} style={styles.fileThumbWrap}>
                    <Image source={{ uri }} style={styles.fileThumb} />
                    <TouchableOpacity style={styles.fileRemove} onPress={() => removeUploadFile(i)}><X size={10} color={colors.textOnPrimary} /></TouchableOpacity>
                  </View>
                ))}
                {uploadFiles.length < 3 && (
                  <TouchableOpacity style={styles.addFileBtn} onPress={pickUploadImage}>
                    <ImagePlus size={22} color={colors.textTertiary} />
                    <Text style={styles.addFileText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Note */}
              <Text style={styles.modalLabel}>Note to Client</Text>
              <TextInput style={styles.noteInput} value={uploadNote} onChangeText={setUploadNote} placeholder="Describe your design choices..." placeholderTextColor={colors.textTertiary} multiline />

              {/* Submit */}
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSubmitDesign} disabled={isUploading}>
                {isUploading ? <ActivityIndicator color={colors.textOnPrimary} size="small" /> : <Text style={styles.modalSubmitText}>Submit for Review</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: colors.screenBg },
  safeArea: { flex: 1 },
  mainScroll: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    flex: 1,
  },
  acceptBtn: {
    backgroundColor: colors.btnDisabled,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  acceptBtnText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },

  titleBox: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
  },
  titleText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.sm + 1,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },

  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: radii.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },
  detailValue: {
    fontSize: fontSizes.xs + 1,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    flexShrink: 1,
  },
  detailLabelDark: {
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.heavy,
  },
  detailValueDark: {
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.heavy,
  },

  timelineBox: {
    marginTop: spacing.md,
    paddingLeft: 10,
    gap: spacing.sm,
  },
  timelineTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.heavy,
    marginBottom: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineBullet: {
    fontSize: fontSizes.xs + 1,
    color: colors.primary,
    fontWeight: '700',
    width: 110,
    fontFamily: fonts.heavy,
  },
  timelineInput: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.cardBg,
    height: 28,
    flex: 1,
    paddingHorizontal: spacing.sm,
    fontSize: fontSizes.xs + 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
  },

  statusSection: {
    marginTop: spacing.xl,
  },
  statusLabel: {
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    color: colors.success,
    marginBottom: spacing.sm,
    fontFamily: fonts.heavy,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.borderInput,
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },
  queryBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queryBtnText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },

  // Submit bar
  submitBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.borderCard,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  submitBtnText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.md,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },

  // Upload Modal
  modalOverlay: {
    flex: 1, backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.cardBg, borderTopLeftRadius: radii['2xl'], borderTopRightRadius: radii['2xl'],
    padding: spacing['2xl'], paddingBottom: Platform.OS === 'ios' ? spacing['4xl'] : spacing['2xl'],
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSizes.xl, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textPrimary,
  },
  modalLabel: {
    fontSize: fontSizes.sm, fontWeight: '600', fontFamily: fonts.medium, color: colors.textSecondary,
    marginTop: 14, marginBottom: spacing.sm,
  },
  roundRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  roundChip: {
    paddingHorizontal: 14, paddingVertical: spacing.sm, borderRadius: radii['2xl'],
    borderWidth: 1.5, borderColor: colors.borderInput, backgroundColor: colors.sectionBg,
  },
  roundChipActive: { borderColor: colors.primary, backgroundColor: '#EEF2FF' },
  roundChipText: { fontSize: fontSizes.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  roundChipTextActive: { color: colors.primary, fontWeight: '700' },
  fileGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  fileThumbWrap: { width: 80, height: 80, borderRadius: radii.md, overflow: 'hidden', position: 'relative' },
  fileThumb: { width: '100%', height: '100%' },
  fileRemove: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(239,68,68,0.85)', borderRadius: radii.md,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  addFileBtn: {
    width: 80, height: 80, borderRadius: radii.md, borderWidth: 2, borderStyle: 'dashed',
    borderColor: colors.borderInput, alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
  },
  addFileText: { fontSize: fontSizes.xs, fontFamily: fonts.medium, color: colors.textTertiary },
  noteInput: {
    backgroundColor: colors.sectionBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.md, padding: spacing.md, fontSize: fontSizes.sm + 1, fontFamily: fonts.body,
    color: colors.textPrimary, height: 70, textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    backgroundColor: colors.success, paddingVertical: 14, borderRadius: radii.md,
    alignItems: 'center', marginTop: spacing.xl,
  },
  modalSubmitText: {
    color: colors.textOnPrimary, fontSize: fontSizes.md, fontWeight: '700', fontFamily: fonts.heavy,
  },
});
