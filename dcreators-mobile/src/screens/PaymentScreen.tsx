import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity,
  Platform, Alert, ActivityIndicator, Animated, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, CheckCircle, CreditCard, Smartphone, Building2,
  Shield, Lock, X, AlertTriangle,
} from 'lucide-react-native';
import TopHeader from '../components/TopHeader';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

type PaymentMethod = 'card' | 'upi' | 'netbanking';

// Generate a mock transaction ID
function generateTxnId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'TXN';
  for (let i = 0; i < 12; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

export default function PaymentScreen({ navigation, route }: any) {
  const project = route?.params?.project;
  const paymentType = route?.params?.paymentType || 'balance';
  const profile = useAuthStore((s) => s.profile);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [isPaying, setIsPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<'input' | 'processing' | 'done'>('input');
  const [txnId, setTxnId] = useState('');
  const [upiId, setUpiId] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const totalCost = project?.final_offer || project?.budget || 0;
  const budget = project?.budget ? Number(project.budget) : 0;
  const advance = Math.round(budget * 0.5);
  const balance = totalCost - advance;
  const payAmount = paymentType === 'advance' ? advance : balance;

  const METHODS: { key: PaymentMethod; label: string; icon: any; desc: string }[] = [
    { key: 'upi', label: 'UPI', icon: Smartphone, desc: 'Pay via any UPI app' },
    { key: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Rupay' },
    { key: 'netbanking', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
  ];

  useEffect(() => {
    if (isPaid) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [isPaid]);

  // Pulse animation for processing
  useEffect(() => {
    if (gatewayStep === 'processing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [gatewayStep]);

  function handlePayPress() {
    setShowGateway(true);
    setGatewayStep('input');
  }

  async function handleConfirmPayment() {
    if (selectedMethod === 'upi' && !upiId.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }
    setGatewayStep('processing');
    const newTxnId = generateTxnId();
    setTxnId(newTxnId);

    // Simulate 2.5s payment processing
    setTimeout(async () => {
      if (!project?.id || !profile?.id) {
        setGatewayStep('input');
        Alert.alert('Error', 'Missing project or profile data.');
        return;
      }

      try {
        // Record payment in Supabase
        const { error: payErr } = await supabase.from('payments').insert({
          project_id: project.id,
          payer_id: profile.id,
          amount: payAmount,
          payment_type: paymentType,
          status: 'completed',
        });

        if (payErr) {
          setGatewayStep('input');
          Alert.alert('Payment Error', payErr.message);
          return;
        }

        // Update project status
        const newStatus = paymentType === 'advance' ? 'advance_paid' : 'completed';
        const newProgress = paymentType === 'advance' ? 10 : 100;
        await supabase.from('projects').update({
          status: newStatus,
          progress_percent: newProgress,
          updated_at: new Date().toISOString(),
        }).eq('id', project.id);

        // Notify consultant
        if (project.consultant_id) {
          sendNotification({
            userId: project.consultant_id,
            title: paymentType === 'advance' ? 'Advance Payment Received' : 'Balance Payment Received',
            message: `Client paid ₹${payAmount.toLocaleString()} via ${selectedMethod.toUpperCase()}. Txn: ${newTxnId}`,
            type: 'payment',
          });
        }

        setGatewayStep('done');
        setTimeout(() => {
          setShowGateway(false);
          setIsPaid(true);
        }, 1500);
      } catch (err: any) {
        setGatewayStep('input');
        Alert.alert('Error', err.message || 'Something went wrong.');
      }
    }, 2500);
  }

  return (
    <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.bg} imageStyle={{ opacity: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TopHeader />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>

            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ArrowLeft size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.pageTitle}>
                {paymentType === 'advance' ? 'Advance Payment' : 'Balance Payment'}
              </Text>
              <View style={{ width: 36 }} />
            </View>

            {isPaid ? (
              <Animated.View style={[styles.successCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <CheckCircle size={56} color={colors.success} />
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successAmount}>₹{payAmount.toLocaleString()}</Text>
                <View style={styles.receiptBox}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Transaction ID</Text>
                    <Text style={styles.receiptValue}>{txnId}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Method</Text>
                    <Text style={styles.receiptValue}>{selectedMethod.toUpperCase()}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Status</Text>
                    <Text style={[styles.receiptValue, { color: colors.success }]}>Completed ✓</Text>
                  </View>
                </View>
                <Text style={styles.successNote}>
                  {paymentType === 'advance'
                    ? 'Advance paid. The consultant will begin work shortly.'
                    : 'Balance paid. Your project is now complete! 🎉'}
                </Text>
                <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Main')}>
                  <Text style={styles.doneBtnText}>Back to Dashboard</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <>
                {/* Cost Breakdown */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Payment Summary</Text>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Project Budget</Text>
                    <Text style={styles.costValue}>₹{Number(totalCost).toLocaleString()}</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Advance (50%)</Text>
                    <Text style={styles.costValue}>₹{advance.toLocaleString()}</Text>
                  </View>
                  {paymentType === 'balance' && (
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Advance Received</Text>
                      <Text style={[styles.costValue, { color: colors.success }]}>- ₹{advance.toLocaleString()}</Text>
                    </View>
                  )}
                  <View style={styles.divider} />
                  <View style={styles.costRow}>
                    <Text style={styles.totalLabel}>Pay Now</Text>
                    <Text style={styles.totalValue}>₹{payAmount.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Select Payment Method</Text>
                  {METHODS.map((m) => {
                    const Icon = m.icon;
                    const selected = selectedMethod === m.key;
                    return (
                      <TouchableOpacity
                        key={m.key}
                        style={[styles.methodRow, selected && styles.methodRowActive]}
                        onPress={() => setSelectedMethod(m.key)}
                      >
                        <View style={[styles.radio, selected && styles.radioSelected]}>
                          {selected && <View style={styles.radioInner} />}
                        </View>
                        <Icon size={20} color={selected ? colors.primary : colors.textTertiary} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.methodText, selected && styles.methodTextActive]}>{m.label}</Text>
                          <Text style={styles.methodDesc}>{m.desc}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Security Badge */}
                <View style={styles.securityRow}>
                  <Shield size={16} color={colors.success} />
                  <Text style={styles.securityText}>256-bit SSL encrypted · Secured by DCreators</Text>
                  <Lock size={14} color={colors.success} />
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Pay Button */}
        {!isPaid && (
          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.payBtn} onPress={handlePayPress} disabled={isPaying}>
              <Lock size={18} color={colors.textOnPrimary} />
              <Text style={styles.payBtnText}>  Pay ₹{payAmount.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Mock Payment Gateway Modal ── */}
        <Modal visible={showGateway} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.gatewayCard}>

              {gatewayStep === 'input' && (
                <>
                  <View style={styles.gatewayHeader}>
                    <Text style={styles.gatewayTitle}>DCreators Pay</Text>
                    <TouchableOpacity onPress={() => setShowGateway(false)}>
                      <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.gatewayAmountBox}>
                    <Text style={styles.gatewayAmountLabel}>Amount</Text>
                    <Text style={styles.gatewayAmount}>₹{payAmount.toLocaleString()}</Text>
                  </View>

                  {selectedMethod === 'upi' && (
                    <View style={styles.gatewayInputGroup}>
                      <Text style={styles.gatewayFieldLabel}>Enter UPI ID</Text>
                      <TextInput
                        style={styles.gatewayInput}
                        placeholder="yourname@upi"
                        placeholderTextColor={colors.textTertiary}
                        value={upiId}
                        onChangeText={setUpiId}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                      <Text style={styles.gatewayHint}>Demo: Enter any valid UPI format (e.g. demo@ybl)</Text>
                    </View>
                  )}

                  {selectedMethod === 'card' && (
                    <View style={styles.gatewayInputGroup}>
                      <Text style={styles.gatewayFieldLabel}>Card Number</Text>
                      <TextInput style={styles.gatewayInput} placeholder="4706 1312 1121 2123" placeholderTextColor={colors.textTertiary} keyboardType="number-pad" />
                      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.gatewayFieldLabel}>Expiry</Text>
                          <TextInput style={styles.gatewayInput} placeholder="MM/YY" placeholderTextColor={colors.textTertiary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.gatewayFieldLabel}>CVV</Text>
                          <TextInput style={styles.gatewayInput} placeholder="•••" placeholderTextColor={colors.textTertiary} secureTextEntry />
                        </View>
                      </View>
                      <Text style={styles.gatewayHint}>Demo: Any values accepted for testing</Text>
                    </View>
                  )}

                  {selectedMethod === 'netbanking' && (
                    <View style={styles.gatewayInputGroup}>
                      <Text style={styles.gatewayFieldLabel}>Select Bank</Text>
                      <View style={styles.bankGrid}>
                        {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map((bank) => (
                          <TouchableOpacity key={bank} style={styles.bankChip}>
                            <Text style={styles.bankChipText}>{bank}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={styles.gatewayHint}>Demo: Select any bank to proceed</Text>
                    </View>
                  )}

                  <View style={styles.demoNotice}>
                    <AlertTriangle size={14} color="#D97706" />
                    <Text style={styles.demoNoticeText}>Demo Mode — No real money will be charged</Text>
                  </View>

                  <TouchableOpacity style={styles.gatewayPayBtn} onPress={handleConfirmPayment}>
                    <Lock size={16} color={colors.textOnPrimary} />
                    <Text style={styles.gatewayPayBtnText}>  Confirm Payment</Text>
                  </TouchableOpacity>
                </>
              )}

              {gatewayStep === 'processing' && (
                <View style={styles.processingContainer}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={styles.processingCircle}>
                      <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                  </Animated.View>
                  <Text style={styles.processingTitle}>Processing Payment</Text>
                  <Text style={styles.processingSubtitle}>Please wait while we verify your payment...</Text>
                  <Text style={styles.processingTxn}>Txn: {txnId}</Text>
                </View>
              )}

              {gatewayStep === 'done' && (
                <View style={styles.processingContainer}>
                  <CheckCircle size={64} color={colors.success} />
                  <Text style={[styles.processingTitle, { color: colors.success }]}>Payment Verified!</Text>
                  <Text style={styles.processingSubtitle}>Redirecting back...</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: fontSizes.xl, fontFamily: fonts.heavy, color: colors.textPrimary },

  card: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: '#E6E6E6',
    borderRadius: radii.lg, padding: spacing.xl - 2, marginBottom: spacing.xl - 2, ...shadows.card,
  },
  cardTitle: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: 14 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  costLabel: { fontSize: fontSizes.sm + 1, fontFamily: fonts.body, color: colors.textSecondary },
  costValue: { fontSize: fontSizes.sm + 1, fontFamily: fonts.medium, color: colors.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  totalLabel: { fontSize: fontSizes.md, fontFamily: fonts.heavy, color: colors.primary, fontWeight: '700' },
  totalValue: { fontSize: fontSizes.lg + 1, fontFamily: fonts.heavy, color: colors.primary, fontWeight: '700' },

  methodRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: 14, paddingHorizontal: spacing.md, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  methodRowActive: { borderColor: colors.primary, backgroundColor: '#EEF2FF' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.borderInput, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  methodText: { fontSize: fontSizes.base, fontFamily: fonts.medium, color: colors.textSecondary },
  methodTextActive: { color: colors.primary, fontWeight: '600' },
  methodDesc: { fontSize: fontSizes.xs + 1, fontFamily: fonts.body, color: colors.textTertiary, marginTop: 1 },

  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  securityText: { fontSize: fontSizes.xs + 1, fontFamily: fonts.body, color: colors.textTertiary },

  // Success
  successCard: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radii.xl, padding: spacing['2xl'], marginTop: spacing.xl, gap: spacing.md, ...shadows.card,
  },
  successTitle: { fontSize: 22, fontFamily: fonts.heavy, color: colors.success },
  successAmount: { fontSize: 32, fontFamily: fonts.heavy, color: colors.textPrimary },
  successNote: { fontSize: fontSizes.sm + 1, fontFamily: fonts.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  receiptBox: { width: '100%', backgroundColor: colors.sectionBg, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  receiptLabel: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textTertiary },
  receiptValue: { fontSize: fontSizes.sm, fontFamily: fonts.heavy, color: colors.textPrimary },
  doneBtn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: spacing['4xl'], borderRadius: radii.md, marginTop: spacing.md },
  doneBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.md, fontWeight: '700', fontFamily: fonts.heavy },

  actionBar: {
    paddingHorizontal: spacing.xl, paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 14,
    backgroundColor: colors.cardBg, borderTopWidth: 1, borderTopColor: colors.borderCard,
  },
  payBtn: {
    backgroundColor: colors.success, paddingVertical: spacing.lg, borderRadius: radii.lg,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  payBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.lg + 1, fontWeight: '700', fontFamily: fonts.heavy },

  // ── Modal Gateway ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  gatewayCard: {
    backgroundColor: colors.cardBg, borderTopLeftRadius: radii['2xl'], borderTopRightRadius: radii['2xl'],
    padding: spacing.xl, paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
    minHeight: 380,
  },
  gatewayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  gatewayTitle: { fontSize: fontSizes.xl, fontFamily: fonts.heavy, color: colors.primary },

  gatewayAmountBox: {
    backgroundColor: '#EEF2FF', borderRadius: radii.md, padding: spacing.lg,
    alignItems: 'center', marginBottom: spacing.xl,
  },
  gatewayAmountLabel: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textSecondary },
  gatewayAmount: { fontSize: 28, fontFamily: fonts.heavy, color: colors.primary, marginTop: spacing.xs },

  gatewayInputGroup: { marginBottom: spacing.lg },
  gatewayFieldLabel: { fontSize: fontSizes.sm, fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: spacing.sm },
  gatewayInput: {
    backgroundColor: colors.sectionBg, borderWidth: 1, borderColor: colors.borderInput,
    borderRadius: radii.md, height: 48, paddingHorizontal: spacing.md,
    fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textPrimary,
  },
  gatewayHint: { fontSize: fontSizes.xs, fontFamily: fonts.body, color: colors.textTertiary, marginTop: spacing.xs, fontStyle: 'italic' },

  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  bankChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.sectionBg, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.borderInput,
  },
  bankChipText: { fontSize: fontSizes.sm, fontFamily: fonts.heavy, color: colors.textPrimary },

  demoNotice: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: '#FEF3C7', borderRadius: radii.md, padding: spacing.md,
    marginBottom: spacing.lg,
  },
  demoNoticeText: { fontSize: fontSizes.sm, fontFamily: fonts.medium, color: '#92400E' },

  gatewayPayBtn: {
    backgroundColor: colors.success, paddingVertical: 16, borderRadius: radii.lg,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  gatewayPayBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.lg, fontWeight: '700', fontFamily: fonts.heavy },

  // Processing
  processingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['4xl'], gap: spacing.lg },
  processingCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  processingTitle: { fontSize: fontSizes.xl, fontFamily: fonts.heavy, color: colors.textPrimary },
  processingSubtitle: { fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textSecondary },
  processingTxn: { fontSize: fontSizes.sm, fontFamily: fonts.medium, color: colors.textTertiary, marginTop: spacing.sm },
});
