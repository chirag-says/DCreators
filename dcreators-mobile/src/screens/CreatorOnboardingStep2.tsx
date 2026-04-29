import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, radii } from '../styles/theme';

export default function CreatorOnboardingStep2({ navigation, route }: any) {
  const { onboardingData } = route.params || {};

  const [hourlyRate, setHourlyRate] = useState('');
  const [projectRate, setProjectRate] = useState('');
  const [availability, setAvailability] = useState('Full-time');

  function handleNext() {
    navigation.navigate('CreatorOnboardingStep3', {
      onboardingData: { ...onboardingData, hourlyRate, projectRate, availability },
    });
  }

  const canContinue = hourlyRate.length > 0 && projectRate.length > 0;

  return (
    <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <View style={styles.stepper}>
              <View style={[styles.dot, styles.dotDone]} />
              <View style={[styles.line, styles.lineDone]} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.line} />
              <View style={styles.dot} />
            </View>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Set your pricing &{'\n'}availability</Text>
            <Text style={styles.desc}>Let clients know what to expect for your services.</Text>

            {/* Form */}
            <View style={styles.form}>

              <View style={styles.field}>
                <Text style={styles.label}>Hourly Rate (₹)</Text>
                <View style={styles.iconInput}>
                  <Text style={styles.rupee}>₹</Text>
                  <TextInput
                    style={styles.inputInner}
                    placeholder="e.g. 500"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Starting Project Rate (₹)</Text>
                <View style={styles.iconInput}>
                  <Text style={styles.rupee}>₹</Text>
                  <TextInput
                    style={styles.inputInner}
                    placeholder="e.g. 20000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={projectRate}
                    onChangeText={setProjectRate}
                  />
                </View>
                <Text style={styles.hint}>Minimum budget you usually accept for an engagement.</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Availability</Text>
                <View style={styles.pillRow}>
                  {['Full-time', 'Part-time', 'Weekends Only', 'Project Basis'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pill, availability === opt && styles.pillActive]}
                      onPress={() => setAvailability(opt)}
                    >
                      <Text style={[styles.pillText, availability === opt && styles.pillTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, !canContinue && styles.btnDisabled]}
              activeOpacity={0.8}
              onPress={handleNext}
              disabled={!canContinue}
            >
              <Text style={styles.btnText}>Continue</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#B0ADA8' },
  dotDone: { backgroundColor: colors.success },
  dotActive: { backgroundColor: colors.primary, width: 12, height: 12, borderRadius: 6 },
  line: { width: 28, height: 2, backgroundColor: '#C5C2BC', marginHorizontal: spacing.xs },
  lineDone: { backgroundColor: colors.success },
  scroll: { paddingHorizontal: spacing['2xl'], paddingBottom: spacing['4xl'] },
  title: { fontSize: 26, fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: spacing.sm },
  desc: { fontSize: fontSizes.md, fontFamily: fonts.body, color: colors.textSecondary, marginBottom: 28, lineHeight: 22 },
  form: { gap: 22 },
  field: { gap: spacing.sm },
  label: { fontSize: fontSizes.base, fontFamily: fonts.medium, color: colors.textPrimary },
  iconInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(200,200,200,0.6)', borderRadius: radii.md },
  rupee: { fontSize: fontSizes.xl, color: colors.textSecondary, paddingLeft: 14, fontFamily: fonts.medium },
  inputInner: { flex: 1, paddingHorizontal: 10, paddingVertical: 14, fontSize: fontSizes.md, fontFamily: fonts.body, color: colors.textPrimary },
  hint: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textTertiary, marginTop: 2 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { paddingHorizontal: spacing.xl, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: 'rgba(200,200,200,0.5)', borderRadius: radii['2xl'] },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: fontSizes.base },
  pillTextActive: { color: colors.textOnPrimary },
  footer: { paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(200,200,200,0.4)' },
  btn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg, borderRadius: radii.lg },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: colors.textOnPrimary, fontSize: fontSizes.lg, fontFamily: fonts.heavy },
});
