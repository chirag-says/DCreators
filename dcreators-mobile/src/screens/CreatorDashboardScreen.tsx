/**
 * CreatorDashboardScreen — Consultant Home
 * Role: CONSULTANT | Figma: "Creators Dashboard - Final.png"
 *
 * Toggle at top:
 *   "Sales Dashboard"   → shows ConsultantDashboard (artwork_orders, Product B)
 *   "Project Dashboard" → shows this portfolio grid (shop_products)
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, Platform, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Edit3, Trash2, Plus, Bell,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii } from '../styles/theme';
import ConsultantDashboard from '../components/dashboard/ConsultantDashboard';

const NAVY   = '#1B3A5C';
const ORANGE = '#E87B35';
const TEAL   = '#3D9B8F';
const BG     = '#EDF1F5';

export default function CreatorDashboardScreen({ navigation }: any) {
  const consultantProfile = useAuthStore(s => s.consultantProfile);
  const profile           = useAuthStore(s => s.profile);

  // "Sales Dashboard" | "Project Dashboard" toggle (Figma top pills)
  const [activeTab, setActiveTab] = useState<'sales' | 'portfolio'>('portfolio');

  const [products,   setProducts]   = useState<any[]>([]);
  const [projects,   setProjects]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchProducts(); fetchProjects(); }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => { fetchProducts(); fetchProjects(); });
    return unsub;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchProducts(), fetchProjects()]).finally(() => setRefreshing(false));
  }, []);

  async function fetchProducts() {
    if (!consultantProfile?.id) { setLoading(false); return; }
    try {
      const { data } = await supabase
        .from('shop_products')
        .select('*')
        .eq('consultant_id', consultantProfile.id)
        .order('created_at', { ascending: false });
      setProducts(data ?? []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }

  async function fetchProjects() {
    const userId = consultantProfile?.user_id ?? profile?.id;
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('projects')
        .select('*, profiles!client_id(name, avatar_url)')
        .eq('consultant_id', userId)
        .in('status', ['assigned', 'advance_pending', 'advance_paid', 'work_order_generated', 'work_order_accepted', 'in_progress', 'review_1', 'review_2', 'final_review'])
        .order('created_at', { ascending: false });
      setProjects(data ?? []);
    } catch { setProjects([]); }
  }

  async function handleDelete(p: any) {
    Alert.alert('Delete Product', `Delete "${p.title}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('shop_products').delete().eq('id', p.id);
        setProducts(prev => prev.filter(x => x.id !== p.id));
      }},
    ]);
  }

  function getAvailabilityLabel(p: any): string {
    if (p.is_active === false) return 'Not for Sale';
    return 'Available for Sale';
  }

  function getAvailabilityColor(p: any): string {
    const label = getAvailabilityLabel(p);
    if (label === 'Not for Sale') return '#DC2626';
    return '#059669';
  }

  // ── Sales Dashboard tab renders ConsultantDashboard (Product B) ──
  if (activeTab === 'sales') {
    return (
      <View style={{ flex: 1 }}>
        {/* Toggle stays visible at the very top */}
        <SafeAreaView style={{ backgroundColor: BG }} edges={['top']}>
          <View style={s.toggleRow}>
            <TouchableOpacity
              style={[s.toggleBtn, s.toggleBtnActive]}
              onPress={() => setActiveTab('sales')}
              activeOpacity={0.8}
            >
              <Text style={[s.toggleLabel, s.toggleLabelActive]}>Sales Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.toggleBtn}
              onPress={() => setActiveTab('portfolio')}
              activeOpacity={0.8}
            >
              <Text style={s.toggleLabel}>Project Dashboard</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        {/* ConsultantDashboard handles its own SafeAreaView / scroll */}
        <ConsultantDashboard navigation={navigation} />
      </View>
    );
  }

  // ── Portfolio / Project Dashboard tab ──
  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.tagline}>HIRE CREATIVES. BUY ART. BUILD IDEAS</Text>
          <Text style={s.dashTitle}>{'Creator\'s\nDashboard'}</Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Bell size={18} color={NAVY} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditConsultantProfile')}
            activeOpacity={0.8}
          >
            {profile?.avatar_url
              ? <Image source={{ uri: profile.avatar_url }} style={s.avatar} />
              : <View style={[s.avatar, s.avatarFallback]}>
                  <Text style={s.avatarInitial}>{(profile?.name ?? 'A').charAt(0).toUpperCase()}</Text>
                </View>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* Sales Dashboard / Project Dashboard toggle pills */}
      <View style={s.toggleRow}>
        <TouchableOpacity
          style={s.toggleBtn}
          onPress={() => setActiveTab('sales')}
          activeOpacity={0.8}
        >
          <Text style={s.toggleLabel}>Sales Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, s.toggleBtnActive]}
          onPress={() => setActiveTab('portfolio')}
          activeOpacity={0.8}
        >
          <Text style={[s.toggleLabel, s.toggleLabelActive]}>Project Dashboard</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />}
      >

        {/* 2A.2: Incoming project assignments inbox */}
        {projects.length > 0 && (
          <View style={s.inboxSection}>
            <Text style={s.inboxTitle}>Active Project Assignments</Text>
            {projects.map((proj: any) => {
              const clientName = (proj.profiles as any)?.name ?? 'Client';
              const STATUS_COLORS: Record<string, string> = {
                assigned: '#E87B35', advance_pending: '#F59E0B', in_progress: '#0D7F7A',
                review_1: '#6366F1', review_2: '#8B5CF6', final_review: '#EC4899',
                work_order_generated: '#3B82F6', work_order_accepted: '#10B981',
                advance_paid: '#14B8A6',
              };
              const badgeColor = STATUS_COLORS[proj.status] ?? '#9CA3AF';
              return (
                <TouchableOpacity
                  key={proj.id}
                  style={s.projectCard}
                  onPress={() => navigation.navigate('Main', { screen: 'CreatorWorkorder', params: { project: proj } })}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.projectCardTitle} numberOfLines={1}>
                      {proj.assignment_details?.[0] ?? proj.assignment_type ?? 'Creative Project'}
                    </Text>
                    <Text style={s.projectCardClient}>From: {clientName}</Text>
                    {proj.budget && <Text style={s.projectCardBudget}>₹{Number(proj.budget).toLocaleString('en-IN')}</Text>}
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: badgeColor + '22' }]}>
                    <Text style={[s.statusBadgeText, { color: badgeColor }]}>{proj.status.replace(/_/g, ' ').toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Portfolio listing header */}
        <View style={s.listHeader}>
          <Text style={s.listTitle}>My Artwork Listings</Text>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => navigation.navigate('AddEditProduct')}
            activeOpacity={0.85}
          >
            <Plus size={16} color="#fff" />
            <Text style={s.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 40 }} />
        ) : products.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyTitle}>No listings yet</Text>
            <Text style={s.emptySub}>Add your first artwork to start selling</Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => navigation.navigate('AddEditProduct')}
              activeOpacity={0.85}
            >
              <Plus size={16} color="#fff" />
              <Text style={s.emptyBtnText}>Add Artwork</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.productList}>
            {products.map(p => {
              const coverUri = p.images?.[0] ?? null;
              const availLabel = getAvailabilityLabel(p);
              const availColor = getAvailabilityColor(p);
              return (
                <View key={p.id} style={s.productCard}>
                  {/* Image */}
                  <View style={s.productImgWrap}>
                    {coverUri
                      ? <Image source={{ uri: coverUri }} style={s.productImg} resizeMode="cover" />
                      : <View style={[s.productImg, s.productImgPlaceholder]} />
                    }
                  </View>

                  {/* Info */}
                  <View style={s.productInfo}>
                    <Text style={s.productCategory}>{p.category ?? 'Artwork'}</Text>
                    <Text style={s.productTitle} numberOfLines={2}>{p.title}</Text>
                    <TouchableOpacity>
                      <Text style={s.productBrief}>
                        {p.description ? 'Artwork Brief...' : 'No description'}
                      </Text>
                    </TouchableOpacity>
                    <Text style={s.productSize}>
                      Size: {p.size ?? 'Open'}
                    </Text>
                    <Text style={s.productPrice}>
                      ₹{Number(p.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                    {/* Availability label — Figma requirement */}
                    <Text style={[s.availLabel, { color: availColor }]}>{availLabel}</Text>
                  </View>

                  {/* Edit pencil */}
                  <View style={s.productActions}>
                    <TouchableOpacity
                      style={s.actionBtn}
                      onPress={() => navigation.navigate('AddEditProduct', { product: p })}
                      activeOpacity={0.7}
                    >
                      <Edit3 size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.actionBtn}
                      onPress={() => handleDelete(p)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={s.footer}>
          A joint venture of Ishisoft Pvt.Ltd, Mr. Shoumik Mazumder and{'\n'}
          Design & Animation Club, Department of Visual Arts, AUS{'\n'}
          Honorary Design Mentor — Dr. Gautam Dutta, Department of Visual Arts, AUS
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  inboxSection: { marginHorizontal: 20, marginBottom: 16, marginTop: 8 },
  inboxTitle: { fontSize: 13, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY, marginBottom: 10, letterSpacing: 0.3 },
  projectCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E8EAF0', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }) },
  projectCardTitle: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY },
  projectCardClient: { fontSize: fontSizes.xs, fontFamily: fonts.body, color: colors.textSecondary, marginTop: 2 },
  projectCardBudget: { fontSize: fontSizes.sm, fontWeight: '700', fontFamily: fonts.heavy, color: ORANGE, marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginLeft: 8 },
  statusBadgeText: { fontSize: 9, fontWeight: '700', fontFamily: fonts.heavy, letterSpacing: 0.3 },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4,
  },
  tagline: { fontSize: 9, fontFamily: fonts.body, color: colors.textTertiary, letterSpacing: 0.5, marginBottom: 4 },
  dashTitle: { fontSize: 36, fontWeight: '900', fontFamily: fonts.heavy, color: NAVY, lineHeight: 40 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 16, fontWeight: '800', color: '#fff', fontFamily: fonts.heavy },

  // Toggle pills (Figma "Sales Dashboard | Project Dashboard")
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: BG,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    borderColor: NAVY,
  },
  toggleLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  toggleLabelActive: {
    color: NAVY,
    fontWeight: '800',
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  listHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  listTitle: { fontSize: fontSizes.lg, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: NAVY, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontSize: fontSizes.sm, fontWeight: '700', fontFamily: fonts.heavy },

  productList: { gap: 0 },
  productCard: {
    backgroundColor: '#fff', flexDirection: 'row', gap: 12,
    paddingVertical: 14, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#F0F2F8',
  },
  productImgWrap: { borderRadius: 10, overflow: 'hidden' },
  productImg: { width: 100, height: 90, borderRadius: 10 },
  productImgPlaceholder: { backgroundColor: '#E5E7EB' },
  productInfo: { flex: 1, gap: 2 },
  productCategory: { fontSize: fontSizes.xs, fontWeight: '700', fontFamily: fonts.heavy, color: ORANGE, letterSpacing: 0.3 },
  productTitle: { fontSize: fontSizes.base, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY, lineHeight: 18 },
  productBrief: { fontSize: fontSizes.xs + 1, fontFamily: fonts.body, color: TEAL },
  productSize: { fontSize: fontSizes.xs + 1, fontFamily: fonts.body, color: colors.textTertiary },
  productPrice: { fontSize: fontSizes.base, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY, marginTop: 2 },
  availLabel: { fontSize: fontSizes.xs, fontWeight: '700', fontFamily: fonts.heavy, marginTop: 2 },
  productActions: { justifyContent: 'center', gap: 8 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },

  emptyWrap: { alignItems: 'center', marginTop: 40, gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: fontSizes.xl, fontFamily: fonts.heavy, color: colors.textSecondary },
  emptySub: { fontSize: fontSizes.sm + 1, fontFamily: fonts.body, color: colors.textTertiary, textAlign: 'center' },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: NAVY, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.md, marginTop: 12 },
  emptyBtnText: { color: '#fff', fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy },

  footer: {
    fontSize: 9, fontFamily: fonts.body, color: colors.textTertiary,
    textAlign: 'center', lineHeight: 14, marginTop: 32,
  },
});
