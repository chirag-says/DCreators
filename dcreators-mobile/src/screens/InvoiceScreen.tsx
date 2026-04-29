import React from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Download, FileText } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

export default function InvoiceScreen({ navigation, route }: any) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.cardBg }]} edges={['top']}>
      <ImageBackground 
        source={require('../../assets/bg-texture.png')} 
        style={styles.backgroundImage}
        imageStyle={{ opacity: 1 }}
      >
      
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoice</Text>
          <TouchableOpacity>
            <Download size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            
            {/* Invoice Header */}
            <View style={styles.invoiceCard}>
              <View style={styles.invoiceIconRow}>
                <View style={styles.invoiceIconCircle}>
                  <FileText size={28} color={colors.primary} />
                </View>
              </View>
              <Text style={styles.invoiceNumber}>INV-2026-1021</Text>
              <Text style={styles.invoiceDate}>Issued: 6th May 2026</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>PAID</Text>
              </View>
            </View>

            {/* From / To */}
            <View style={styles.partyRow}>
              <View style={styles.partyBox}>
                <Text style={styles.partyLabel}>From</Text>
                <Text style={styles.partyName}>DCreators Pvt Ltd</Text>
                <Text style={styles.partyDetail}>Kolkata, WB 700001</Text>
                <Text style={styles.partyDetail}>GST: 19AABCD1234F1Z5</Text>
              </View>
              <View style={[styles.partyBox, { borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: spacing.lg }]}>
                <Text style={styles.partyLabel}>To</Text>
                <Text style={styles.partyName}>Mr. Aniket Ghosh</Text>
                <Text style={styles.partyDetail}>Client ID: C-4021</Text>
                <Text style={styles.partyDetail}>Kolkata, WB 700054</Text>
              </View>
            </View>

            {/* Line Items */}
            <View style={styles.lineItemsCard}>
              <Text style={styles.sectionTitle}>Items</Text>

              <View style={styles.lineItem}>
                <View style={styles.lineItemLeft}>
                  <Text style={styles.lineItemName}>Brand Manual Design</Text>
                  <Text style={styles.lineItemDesc}>D101/Shoumik Sen</Text>
                </View>
                <Text style={styles.lineItemAmount}>₹8,000</Text>
              </View>

              <View style={styles.lineItem}>
                <View style={styles.lineItemLeft}>
                  <Text style={styles.lineItemName}>Social Media Creatives (x5)</Text>
                  <Text style={styles.lineItemDesc}>D101/Shoumik Sen</Text>
                </View>
                <Text style={styles.lineItemAmount}>₹3,000</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>₹11,000</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Platform Fee (5%)</Text>
                <Text style={styles.totalValue}>₹550</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>GST (18%)</Text>
                <Text style={styles.totalValue}>₹2,079</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { fontWeight: '700', color: colors.textPrimary, fontSize: fontSizes.lg }]}>Grand Total</Text>
                <Text style={[styles.totalValue, { fontWeight: '700', color: colors.primary, fontSize: fontSizes.lg }]}>₹13,629</Text>
              </View>
            </View>

            {/* Payment Info */}
            <View style={styles.paymentInfoCard}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Method</Text>
                <Text style={styles.infoValue}>UPI / Razorpay</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction ID</Text>
                <Text style={styles.infoValue}>TXN-RPY-8832991</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Paid On</Text>
                <Text style={styles.infoValue}>6th May 2026, 3:42 PM</Text>
              </View>
            </View>

          </View>
        </ScrollView>

        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.downloadBtn}>
            <Download size={18} color={colors.textOnPrimary} />
            <Text style={styles.downloadBtnText}>Download PDF</Text>
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: colors.screenBg },
  safeArea: { flex: 1 },
  mainScroll: { flex: 1 },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },
  
  header: {
    backgroundColor: colors.cardBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderCard,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy },

  invoiceCard: {
    backgroundColor: colors.cardBg,
    padding: spacing['2xl'],
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  invoiceIconRow: { marginBottom: spacing.md },
  invoiceIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  invoiceNumber: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy, marginBottom: spacing.xs },
  invoiceDate: { fontSize: fontSizes.sm, color: colors.textSecondary, fontFamily: fonts.medium, marginBottom: spacing.md },
  statusBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radii.md },
  statusText: { fontSize: fontSizes.sm, fontWeight: '700', color: '#059669', fontFamily: fonts.heavy },

  partyRow: { flexDirection: 'row', backgroundColor: colors.cardBg, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  partyBox: { flex: 1 },
  partyLabel: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', marginBottom: spacing.sm, fontFamily: fonts.heavy },
  partyName: { fontSize: fontSizes.base, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy, marginBottom: spacing.xs },
  partyDetail: { fontSize: fontSizes.xs + 1, color: colors.textSecondary, fontFamily: fonts.medium, marginBottom: 2 },

  lineItemsCard: { backgroundColor: colors.cardBg, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  sectionTitle: { fontSize: fontSizes.base, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy, marginBottom: spacing.lg },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  lineItemLeft: { flex: 1 },
  lineItemName: { fontSize: fontSizes.sm + 1, fontWeight: '600', color: colors.textPrimary, fontFamily: fonts.medium },
  lineItemDesc: { fontSize: fontSizes.xs + 1, color: colors.textTertiary, fontFamily: fonts.medium },
  lineItemAmount: { fontSize: fontSizes.base, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  totalLabel: { fontSize: fontSizes.sm + 1, color: colors.textSecondary, fontFamily: fonts.medium },
  totalValue: { fontSize: fontSizes.sm + 1, color: colors.textPrimary, fontFamily: fonts.medium },

  paymentInfoCard: { backgroundColor: colors.cardBg, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  infoLabel: { fontSize: fontSizes.sm, color: colors.textTertiary, fontFamily: fonts.medium },
  infoValue: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary, fontFamily: fonts.medium },

  actionsBar: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  downloadBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  downloadBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy },
});
