import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../components/TopHeader';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

export default function FinalizeOfferScreen({ navigation }: any) {
  const [agreedCost, setAgreedCost] = useState('11,000/-');
  const [advance, setAdvance] = useState('5,000/-');

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
            
            <View style={styles.headerBox}>
              <Text style={styles.headerTitle}>Finalizing Offer</Text>
              <Text style={styles.headerSubtitle}>Please confirm the final assignment cost and requested advance payment before locking the workorder.</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { borderColor: colors.primary }]}>
                <Text style={[styles.inputLabel, { color: colors.primary }]}>Total Assignment Cost</Text>
                <View style={[styles.verticalSeparator, { backgroundColor: colors.primary }]} />
                <TextInput 
                  style={styles.textInput} 
                  value={agreedCost} 
                  onChangeText={setAgreedCost}
                  keyboardType="number-pad" 
                />
              </View>

              <View style={[styles.inputContainer, { borderColor: colors.success }]}>
                <Text style={[styles.inputLabel, { color: colors.success }]}>Advance Requested</Text>
                <View style={[styles.verticalSeparator, { backgroundColor: colors.success }]} />
                <TextInput 
                  style={styles.textInput} 
                  value={advance} 
                  onChangeText={setAdvance}
                  keyboardType="number-pad" 
                />
              </View>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Note: Once you submit this final offer, the client will be notified to make the advance payment. The workorder officially begins when the advance is received.
              </Text>
            </View>

          </View>
        </ScrollView>

        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => navigation.goBack()}>
            <Text style={styles.actionBtnTextDark}>Edit Timelines</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.actionBtnTextLight}>Send Final Offer</Text>
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
  
  headerBox: {
    marginBottom: spacing['2xl'],
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontFamily: fonts.heavy,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.xl,
    fontFamily: fonts.body,
  },

  formContainer: {
    gap: spacing.lg,
    backgroundColor: colors.cardBg,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderInput,
    ...shadows.card,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: colors.cardBg,
    height: 48,
  },
  inputLabel: {
    width: 140,
    paddingLeft: spacing.md,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    fontFamily: fonts.heavy,
  },
  verticalSeparator: {
    width: 1.5,
    height: '100%',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.base,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.heavy,
  },

  warningBox: {
    marginTop: spacing['2xl'],
    padding: spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radii.sm,
  },
  warningText: {
    fontSize: fontSizes.xs + 1,
    color: colors.error,
    lineHeight: 16,
    fontFamily: fonts.medium,
  },

  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: colors.inputBg,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  actionBtnTextDark: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: fontSizes.sm + 1,
    fontFamily: fonts.heavy,
  },
  actionBtnTextLight: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: fontSizes.sm + 1,
    fontFamily: fonts.heavy,
  },
});
