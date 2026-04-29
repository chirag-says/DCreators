import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { colors, fonts, fontSizes, spacing, radii } from '../styles/theme';

export default function CreatorOnboardingStep3({ navigation, route }: any) {
  const { onboardingData } = route.params || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile, setRole, fetchConsultantProfile } = useAuthStore();

  async function handleComplete() {
    if (!profile?.id) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = `D${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { error } = await supabase.from('consultant_profiles').insert({
        user_id: profile.id,
        display_name: profile.name,
        code,
        category: onboardingData?.category || 'designer',
        subtitle: onboardingData?.subtitle || null,
        experience: onboardingData?.experience || null,
        expertise: onboardingData?.expertise || null,
        base_price: onboardingData?.projectRate ? parseFloat(onboardingData.projectRate) : null,
        is_approved: true,
        is_active: true,
      });

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Already Registered', 'You already have a consultant profile.');
        } else {
          Alert.alert('Error', error.message);
        }
        setIsSubmitting(false);
        return;
      }

      await supabase.from('profiles').update({ has_consultant_profile: true }).eq('id', profile.id);
      await fetchConsultantProfile();
      setRole('consultant');

      navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Dashboard' } }] });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const rows = [
    { label: 'Category', value: onboardingData?.category ? onboardingData.category.charAt(0).toUpperCase() + onboardingData.category.slice(1) : '—' },
    { label: 'Expertise', value: onboardingData?.expertise || '—' },
    { label: 'Experience', value: onboardingData?.experience || '—' },
    { label: 'Hourly Rate', value: onboardingData?.hourlyRate ? `₹${onboardingData.hourlyRate}/hr` : '—' },
    { label: 'Base Project', value: onboardingData?.projectRate ? `₹${onboardingData.projectRate}` : '—' },
  ];

  return (
    <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.stepper}>
            <View style={[styles.dot, styles.dotDone]} />
            <View style={[styles.line, styles.lineDone]} />
            <View style={[styles.dot, styles.dotDone]} />
            <View style={[styles.line, styles.lineDone]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Success icon */}
          <View style={styles.iconWrap}>
            <CheckCircle2 size={64} color="#10B981" strokeWidth={1.5} />
          </View>

          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.desc}>Review your profile summary before starting.</Text>

          {/* Summary card */}
          <View style={styles.card}>
            {rows.map((row, i) => (
              <View key={row.label}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
                {i < rows.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.btn, isSubmitting && { opacity: 0.6 }]} activeOpacity={0.8} onPress={handleComplete} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#B0ADA8' },
  dotDone: { backgroundColor: colors.success },
  dotActive: { backgroundColor: colors.primary, width: 12, height: 12, borderRadius: 6 },
  line: { width: 28, height: 2, backgroundColor: '#C5C2BC', marginHorizontal: spacing.xs },
  lineDone: { backgroundColor: colors.success },
  scroll: { paddingHorizontal: spacing['2xl'], paddingBottom: spacing['4xl'], alignItems: 'center' },
  iconWrap: { marginVertical: 28 },
  title: { fontSize: 26, fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  desc: { fontSize: fontSizes.md, fontFamily: fonts.body, color: colors.textSecondary, marginBottom: 28, textAlign: 'center', lineHeight: 22 },
  card: { backgroundColor: 'rgba(255,255,255,0.7)', width: '100%', borderRadius: radii.lg, padding: spacing.xl, borderWidth: 1, borderColor: 'rgba(200,200,200,0.5)', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  rowLabel: { fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textSecondary },
  rowValue: { fontSize: fontSizes.md, fontFamily: fonts.medium, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: 'rgba(200,200,200,0.35)' },
  footer: { paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(200,200,200,0.4)' },
  btn: { backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, borderRadius: radii.lg },
  btnText: { color: colors.textOnPrimary, fontSize: fontSizes.lg, fontFamily: fonts.heavy },
});
