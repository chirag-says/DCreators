/**
 * AssignProjectScreen — "Hire & Assign Project"
 * Matches Figma: "Hire a Consultant.png" / "Hire a Consultant-1.png"
 *
 * Layout:
 * - D icon + tagline header
 * - "Hire & Assign Project" heading (navy) + description
 * - White card form:
 *   - HIRE ROLE dropdown
 *   - SELECT CREATIVE ITEMS dropdown
 *   - ASSIGNMENT DATE input
 *   - ASSIGNMENT BUDGET ($) input
 *   - ASSIGNMENT BRIEF multiline
 * - Negotiation Details card (orange gradient)
 *   - Final Project Cost
 *   - Suggested Assignment Deadline
 *   - "Hire with Confidence" tagline
 * - Terms checkbox
 * - "Pay 60% Advance" CTA (navy, full-width)
 * - Reset link
 * - SELECTED CONSULTANT card at bottom
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Calendar, Star, CheckSquare } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { colors, fonts, fontSizes, spacing, radii } from '../styles/theme';
import { RemoteAssets } from '../lib/assets';

// ─── Figma color tokens ──────────────────────────────────────
const NAVY = '#1B3A5C';
const ORANGE = '#E87B35';
const ORANGE_LIGHT = '#FFF5ED';

const HIRE_ROLES = ['Hire Creative Consultant', 'Hire Photographer', 'Hire Designer', 'Hire Sculptor', 'Hire Artisan'];
const CREATIVE_ITEMS = ['Logo Design', 'Brand Identity', 'Photography', 'Illustration', 'Packaging', 'Social Media Kit', 'Web Design', 'Art Direction'];

export default function AssignProjectScreen({ navigation, route }: any) {
  const creator = route?.params?.creator;
  const profile = useAuthStore((s) => s.profile);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Form state
  const [hireRole, setHireRole] = useState(HIRE_ROLES[0]);
  const [creativeItem, setCreativeItem] = useState(CREATIVE_ITEMS[0]);
  const [assignmentDate, setAssignmentDate] = useState('');
  const [budget, setBudget] = useState(creator?.base_price ? String(creator.base_price) : '');
  const [assignmentBrief, setAssignmentBrief] = useState('');

  // Dropdown visibility
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const budgetNum = parseFloat(budget) || 0;
  const advanceAmount = Math.round(budgetNum * 0.6);

  // Compute deadline suggestion (15 days from assignment date)
  const suggestedDeadline = useMemo(() => {
    if (!assignmentDate.trim()) return null;
    try {
      const d = new Date(assignmentDate);
      if (isNaN(d.getTime())) return null;
      d.setDate(d.getDate() + 15);
      return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} (15 Days)`;
    } catch { return null; }
  }, [assignmentDate]);

  const canSubmit = assignmentBrief.trim().length > 0 && budgetNum > 0 && agreedTerms;

  async function handleSubmit() {
    if (!canSubmit) {
      Alert.alert('Missing Info', 'Please fill all required fields and agree to Terms.');
      return;
    }
    if (!profile?.id) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData: Record<string, unknown> = {
        client_id: profile.id,
        assignment_type: hireRole,
        assignment_details: [creativeItem],
        assignment_brief: assignmentBrief.trim(),
        budget: budgetNum,
        status: 'pending',
      };

      if (creator?.id) {
        projectData.consultant_id = creator.id;
      }
      if (assignmentDate.trim()) {
        projectData.deadline = assignmentDate.trim();
      }

      const { data, error } = await supabase.from('projects').insert(projectData).select().single();

      if (error) {
        if (error.code === '23503') {
          Alert.alert('Error', 'The selected consultant profile was not found.');
        } else {
          Alert.alert('Error', error.message);
        }
        return;
      }

      navigation.navigate('Payment', { project: data, paymentType: 'advance' });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setHireRole(HIRE_ROLES[0]);
    setCreativeItem(CREATIVE_ITEMS[0]);
    setAssignmentDate('');
    setBudget('');
    setAssignmentBrief('');
    setAgreedTerms(false);
  }

  return (
    <ImageBackground
      source={{ uri: RemoteAssets.bgTexture }}
      style={styles.bg}
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Header ──────────────────────────── */}
            <View style={styles.headerRow}>
              <Image
                source={{ uri: RemoteAssets.dIcon }}
                style={styles.dIcon}
                resizeMode="contain"
              />
              <Text style={styles.headerTagline}>HIRE CREATIVES. BUY ART. BUILD IDEAS</Text>
            </View>

            {/* ── Title ───────────────────────────── */}
            <Text style={styles.title}>Hire & Assign Project</Text>
            <Text style={styles.subtitle}>
              Create a professional assignment brief and secure the perfect talent for your creative vision.
            </Text>

            {/* ── Form Card ──────────────────────── */}
            <View style={styles.formCard}>

              {/* HIRE ROLE */}
              <View>
                <Text style={styles.fieldLabel}>HIRE ROLE</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => { setShowRoleDropdown(!showRoleDropdown); setShowItemDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownValue}>{hireRole}</Text>
                  <ChevronDown size={18} color={colors.textTertiary} />
                </TouchableOpacity>
                {showRoleDropdown && (
                  <View style={styles.dropdownList}>
                    {HIRE_ROLES.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={styles.dropdownItem}
                        onPress={() => { setHireRole(r); setShowRoleDropdown(false); }}
                      >
                        <Text style={[styles.dropdownItemText, hireRole === r && { color: NAVY, fontWeight: '700' }]}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* SELECT CREATIVE ITEMS */}
              <View>
                <Text style={styles.fieldLabel}>SELECT CREATIVE ITEMS</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => { setShowItemDropdown(!showItemDropdown); setShowRoleDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownValue}>{creativeItem}</Text>
                  <ChevronDown size={18} color={colors.textTertiary} />
                </TouchableOpacity>
                {showItemDropdown && (
                  <View style={styles.dropdownList}>
                    {CREATIVE_ITEMS.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.dropdownItem}
                        onPress={() => { setCreativeItem(item); setShowItemDropdown(false); }}
                      >
                        <Text style={[styles.dropdownItemText, creativeItem === item && { color: NAVY, fontWeight: '700' }]}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* ASSIGNMENT DATE */}
              <View>
                <Text style={styles.fieldLabel}>ASSIGNMENT DATE</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="mm/dd/yyyy"
                    placeholderTextColor={colors.textTertiary}
                    value={assignmentDate}
                    onChangeText={setAssignmentDate}
                  />
                  <Calendar size={18} color={colors.textTertiary} />
                </View>
              </View>

              {/* ASSIGNMENT BUDGET */}
              <View>
                <Text style={styles.fieldLabel}>ASSIGNMENT BUDGET ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5,000.00"
                  placeholderTextColor={colors.textTertiary}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* ASSIGNMENT BRIEF */}
              <View>
                <Text style={styles.fieldLabel}>ASSIGNMENT BRIEF</Text>
                <TextInput
                  style={[styles.input, styles.briefInput]}
                  placeholder={'"We are looking for a comprehensive visual identity that balances trust and innovation..."'}
                  placeholderTextColor={colors.textTertiary}
                  value={assignmentBrief}
                  onChangeText={setAssignmentBrief}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* ── Negotiation Details Card ────────── */}
            {budgetNum > 0 && (
              <View style={styles.negotiationCard}>
                <View style={styles.negotiationBadge}>
                  <Text style={styles.negotiationBadgeText}>Negotiation Details</Text>
                </View>
                <Text style={styles.negotiationCost}>
                  Final Project Cost:- {budgetNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.negotiationDeadline}>
                  Suggested Assignment Deadline:-{'\n'}
                  {suggestedDeadline || 'Set date above'}
                </Text>
                <Text style={styles.negotiationConfidence}>Hire with Confidence</Text>
              </View>
            )}

            {/* ── Terms checkbox ──────────────────── */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreedTerms(!agreedTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
                {agreedTerms && <CheckSquare size={14} color="#fff" strokeWidth={2.5} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms and Condition</Text> for creative assignments.
              </Text>
            </TouchableOpacity>

            {/* ── Pay 60% Advance CTA ─────────────── */}
            <TouchableOpacity
              style={[styles.payBtn, (!canSubmit || isSubmitting) && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.payBtnText}>Pay 60% Advance</Text>
              )}
            </TouchableOpacity>

            {/* ── Reset ───────────────────────────── */}
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.7}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>

            {/* ── Selected Consultant Card ─────────── */}
            {creator && (
              <View style={styles.consultantSection}>
                <Text style={styles.selectedLabel}>SELECTED CONSULTANT</Text>
                <View style={styles.consultantCard}>
                  <View style={styles.consultantAvatar}>
                    {creator.avatar_url ? (
                      <Image source={{ uri: creator.avatar_url }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>
                          {(creator.name || 'C').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.consultantInfo}>
                    <Text style={styles.consultantName}>{creator.name || 'Consultant'}</Text>
                    <Text style={styles.consultantMeta}>
                      Creative Consultant • {creator.verified ? 'Verified Pro' : 'Pro'}
                    </Text>
                  </View>
                </View>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Rating</Text>
                  <View style={styles.ratingValue}>
                    <Star size={14} color={ORANGE} fill={ORANGE} />
                    <Text style={styles.ratingNumber}> {creator.rating || '4.9'}/5.0</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },

  // ── Header ────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dIcon: { width: 36, height: 36 },
  headerTagline: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    color: colors.textTertiary,
    letterSpacing: 1.2,
  },

  // ── Title ─────────────────────────────────────
  title: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: fonts.heavy,
    color: NAVY,
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing['2xl'],
  },

  // ── Form card ─────────────────────────────────
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.xl,
    marginBottom: spacing['2xl'],
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  fieldLabel: {
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    backgroundColor: '#fff',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    backgroundColor: '#fff',
  },
  briefInput: {
    minHeight: 140,
    paddingTop: 14,
  },

  // ── Dropdowns ─────────────────────────────────
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    backgroundColor: '#fff',
  },
  dropdownValue: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderTopWidth: 0,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    backgroundColor: '#fff',
    marginTop: -4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },

  // ── Negotiation card ──────────────────────────
  negotiationCard: {
    backgroundColor: ORANGE_LIGHT,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
  },
  negotiationBadge: {
    backgroundColor: ORANGE,
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    marginBottom: spacing.lg,
  },
  negotiationBadgeText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },
  negotiationCost: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: NAVY,
    marginBottom: spacing.md,
  },
  negotiationDeadline: {
    fontSize: fontSizes.base,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: NAVY,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  negotiationConfidence: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.body,
    color: colors.textSecondary,
  },

  // ── Terms ─────────────────────────────────────
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  termsText: {
    flex: 1,
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },

  // ── Pay CTA ───────────────────────────────────
  payBtn: {
    backgroundColor: NAVY,
    borderRadius: radii.full,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  payBtnText: {
    color: '#fff',
    fontSize: fontSizes.lg,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    letterSpacing: 0.3,
  },

  // ── Reset ─────────────────────────────────────
  resetBtn: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  resetText: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },

  // ── Selected Consultant ───────────────────────
  consultantSection: {
    marginBottom: spacing.xl,
  },
  selectedLabel: {
    fontSize: fontSizes.xs + 1,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  consultantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  consultantAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: NAVY,
  },
  consultantInfo: {
    flex: 1,
  },
  consultantName: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: colors.textPrimary,
  },
  consultantMeta: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textSecondary,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: fontSizes.base,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: ORANGE,
  },
});
