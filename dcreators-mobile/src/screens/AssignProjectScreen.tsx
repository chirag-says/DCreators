import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../components/TopHeader';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const ASSIGNMENT_TYPES = ['Design', 'Photography', 'Sculpture', 'Handicraft', 'Branding', 'Art Direction'];

export default function AssignProjectScreen({ navigation, route }: any) {
  const creator = route?.params?.creator;
  const profile = useAuthStore((s) => s.profile);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [assignmentType, setAssignmentType] = useState(creator?.category ? creator.category.charAt(0).toUpperCase() + creator.category.slice(1) : 'Design');
  const [assignmentDetails, setAssignmentDetails] = useState('');
  const [assignmentDate, setAssignmentDate] = useState('');
  const [assignmentBrief, setAssignmentBrief] = useState('');
  const [budget, setBudget] = useState(creator?.base_price ? String(creator.base_price) : '');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const canSubmit = assignmentType && assignmentBrief.trim().length > 0 && budget.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit) {
      Alert.alert('Missing Info', 'Please fill Assignment Brief and Budget at minimum.');
      return;
    }
    if (!profile?.id) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData: any = {
        client_id: profile.id,
        assignment_type: assignmentType.toLowerCase(),
        assignment_details: assignmentDetails ? assignmentDetails.split(',').map((s: string) => s.trim()) : [],
        assignment_brief: assignmentBrief.trim(),
        budget: parseFloat(budget),
        status: 'pending',
      };

      // If a specific consultant was pre-selected
      if (creator?.id) {
        projectData.consultant_id = creator.id;
      }

      // Parse deadline if provided
      if (assignmentDate.trim()) {
        projectData.deadline = assignmentDate.trim();
      }

      const { data, error } = await supabase.from('projects').insert(projectData).select().single();

      if (error) {
        if (error.code === '23503') {
          Alert.alert('Error', 'The selected consultant profile was not found. Please try again.');
        } else {
          Alert.alert('Error', error.message);
        }
        return;
      }

      // Navigate to PaymentScreen with the created project
      navigation.navigate('Payment', {
        project: data,
        paymentType: 'advance',
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setAssignmentType('Design');
    setAssignmentDetails('');
    setAssignmentDate('');
    setAssignmentBrief('');
    setBudget('');
  }

  return (
    <ImageBackground 
      source={require('../../assets/bg-texture.png')} 
      style={styles.backgroundImage}
      imageStyle={{ opacity: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TopHeader />
        
        <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>

            {/* Assigned to banner */}
            {creator?.name && (
              <View style={styles.assignedBanner}>
                <Text style={styles.assignedText}>Assigning to: <Text style={{ fontWeight: '700' }}>{creator.name} ({creator.code})</Text></Text>
              </View>
            )}
            
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, step === 1 ? styles.activeTab : styles.inactiveTab]}
                onPress={() => setStep(1)}
              >
                <Text style={step === 1 ? styles.activeTabText : styles.inactiveTabText}>
                  Step 1 Assignment Detail
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, step === 2 ? styles.activeTab : styles.inactiveTab]}
                onPress={() => setStep(2)}
              >
                <Text style={step === 2 ? styles.activeTabText : styles.inactiveTabText}>
                  Step 2 Payment Detail
                </Text>
              </TouchableOpacity>
            </View>

            {/* Step 1: Assignment Form */}
            {step === 1 && (
              <View style={styles.formContainer}>
                
                {/* Assignment Type (dropdown) */}
                <View>
                  <TouchableOpacity
                    style={[styles.inputContainer, { borderColor: '#00AEEF' }]}
                    onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <Text style={[styles.inputLabel, { color: '#00AEEF' }]}>Assignment Type</Text>
                    <View style={[styles.verticalSeparator, { backgroundColor: '#00AEEF' }]} />
                    <Text style={styles.inputValue}>{assignmentType}</Text>
                    <View style={[styles.triangleDown, { borderTopColor: '#00AEEF' }]} />
                  </TouchableOpacity>
                  {showTypeDropdown && (
                    <View style={styles.dropdown}>
                      {ASSIGNMENT_TYPES.map((t) => (
                        <TouchableOpacity key={t} style={styles.dropdownItem} onPress={() => { setAssignmentType(t); setShowTypeDropdown(false); }}>
                          <Text style={[styles.dropdownText, assignmentType === t && { color: colors.primary, fontWeight: '700' }]}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.inputContainer, { borderColor: '#F26522' }]}>
                  <Text style={[styles.inputLabel, { color: '#F26522' }]}>* Assignment Details</Text>
                  <View style={[styles.verticalSeparator, { backgroundColor: '#F26522' }]} />
                  <TextInput 
                    style={styles.textInput}
                    placeholder="e.g. Brand Manual, Print Ads"
                    placeholderTextColor={colors.textTertiary}
                    value={assignmentDetails}
                    onChangeText={setAssignmentDetails}
                  />
                </View>

                <View style={[styles.inputContainer, { borderColor: colors.success }]}>
                  <Text style={[styles.inputLabel, { color: colors.success }]}>Assignment Date</Text>
                  <View style={[styles.verticalSeparator, { backgroundColor: colors.success }]} />
                  <TextInput 
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textTertiary}
                    value={assignmentDate}
                    onChangeText={setAssignmentDate}
                  />
                </View>

                <View style={[styles.inputContainer, { borderColor: '#EC008C', height: 70 }]}>
                  <Text style={[styles.inputLabel, { color: '#EC008C' }]}>* Assignment Brief</Text>
                  <View style={[styles.verticalSeparator, { backgroundColor: '#EC008C' }]} />
                  <TextInput 
                    style={[styles.textInput, { textAlignVertical: 'top', paddingTop: 8 }]}
                    placeholder="Describe your project..."
                    placeholderTextColor={colors.textTertiary}
                    value={assignmentBrief}
                    onChangeText={setAssignmentBrief}
                    multiline
                  />
                </View>

                <View style={[styles.inputContainer, { borderColor: colors.textPrimary }]}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>* Budget (₹)</Text>
                  <View style={[styles.verticalSeparator, { backgroundColor: colors.textPrimary }]} />
                  <TextInput 
                    style={styles.textInput}
                    placeholder="e.g. 15000"
                    placeholderTextColor={colors.textTertiary}
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="number-pad"
                  />
                </View>

              </View>
            )}

            {/* Step 2: Payment (mock) */}
            {step === 2 && (
              <View style={styles.formContainer}>
                <View style={styles.paymentCard}>
                  <Text style={styles.paymentTitle}>Payment Summary</Text>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Project Budget</Text>
                    <Text style={styles.paymentValue}>₹{budget || '0'}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Advance (50%)</Text>
                    <Text style={styles.paymentValue}>₹{budget ? Math.round(parseFloat(budget) * 0.5) : '0'}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Balance (after approval)</Text>
                    <Text style={styles.paymentValue}>₹{budget ? Math.round(parseFloat(budget) * 0.5) : '0'}</Text>
                  </View>
                  <View style={[styles.paymentRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
                    <Text style={[styles.paymentLabel, { fontWeight: '700', color: colors.textPrimary }]}>Pay Now</Text>
                    <Text style={[styles.paymentValue, { fontWeight: '700', color: colors.primary }]}>₹{budget ? Math.round(parseFloat(budget) * 0.5) : '0'}</Text>
                  </View>
                  <Text style={styles.paymentNote}>Tap Submit to create the project and proceed to payment.</Text>
                </View>
              </View>
            )}

          </View>
        </ScrollView>

        {/* Actions Bar */}
        <View style={styles.actionsBar}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Terms')}>
            <Text style={styles.actionBtnText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.btnDisabled }]} onPress={handleReset}>
            <Text style={styles.actionBtnText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: canSubmit ? colors.success : colors.btnDisabled }]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: colors.screenBg },
  safeArea: { flex: 1 },
  mainScroll: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  
  assignedBanner: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
  },
  assignedText: {
    fontSize: fontSizes.sm + 1,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: spacing['2xl'],
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  activeTab: { backgroundColor: colors.primary },
  inactiveTab: { backgroundColor: colors.btnDisabled },
  activeTabText: {
    color: colors.textOnPrimary, fontSize: fontSizes.sm, fontWeight: '700', fontFamily: fonts.heavy,
  },
  inactiveTabText: {
    color: colors.textOnPrimary, fontSize: fontSizes.sm, fontWeight: '700', fontFamily: fonts.heavy,
  },

  formContainer: { gap: spacing.lg, paddingHorizontal: 10 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: colors.cardBg,
    minHeight: 40,
  },
  inputLabel: {
    width: 130,
    paddingLeft: spacing.sm,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  inputValue: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
  },
  verticalSeparator: { width: 1.5, height: '100%' },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
  },
  triangleDown: {
    width: 0, height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    marginRight: 10,
  },

  // Dropdown
  dropdown: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderTopWidth: 0,
    marginTop: -1,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  dropdownText: {
    fontSize: fontSizes.sm + 1,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },

  // Payment card
  paymentCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.card,
  },
  paymentTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: fontSizes.base,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  paymentNote: {
    fontSize: fontSizes.xs + 1,
    fontFamily: fonts.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Actions bar
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    justifyContent: 'space-between',
    backgroundColor: '#E6E6E6',
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  actionBtnText: {
    color: colors.textOnPrimary,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },
});
