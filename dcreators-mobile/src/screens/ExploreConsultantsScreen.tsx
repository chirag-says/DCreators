/**
 * ExploreConsultantsScreen — Figma Screen 16
 * "Explore Creative Consultant's Portfolio"
 *
 * Layout (top → bottom):
 * 1. Header: D logo icon + tagline | Bell + Avatar
 * 2. Category tab row: Photographer | Designer | Artist | Artisans (icons)
 * 3. "Explore Creative Consultant's Portfolio" title
 * 4. "Creators in Demand" section → hero image card + "View All →"
 * 5. "Photographer's Archive" section → image card + "View All →"
 * 6. "Designer's Desk" section → image card + "View All →"
 * 7. "Artist's Gallery" section → image card + "View All →"
 * 8. "Artisan's Hub" section → image card + "View All →"
 * 9. Bottom: "Sales Dashboard" | "Project Dashboard" pill row
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ArrowRight, Camera, Paintbrush, Palette, Scissors, Users } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii } from '../styles/theme';
import { RemoteAssets } from '../lib/assets';
import type { ConsultantProfile } from '../types';

const { width } = Dimensions.get('window');

// ── Figma tokens ───────────────────────────────────────────────
const NAVY   = '#1B3A5C';
const ORANGE = '#E87B35';
const TEAL   = '#3D9B8F';
const BG     = '#F7F8FA';

// ── Category definitions matching Figma tab icons ──────────────
type Category = 'Photographer' | 'Designer' | 'Artist' | 'Artisan';

const CATEGORIES: {
  key: Category;
  label: string;
  Icon: any;
  sectionTitle: string;
  viewAllLabel: string;
}[] = [
  { key: 'Photographer', label: 'Photographer', Icon: Camera,     sectionTitle: "Photographer's Archive", viewAllLabel: 'View All' },
  { key: 'Designer',     label: 'Designer',     Icon: Paintbrush, sectionTitle: "Designer's Desk",        viewAllLabel: 'View All' },
  { key: 'Artist',       label: 'Artist',       Icon: Palette,    sectionTitle: "Artist's Gallery",       viewAllLabel: 'View All' },
  { key: 'Artisan',      label: 'Artisans',     Icon: Scissors,   sectionTitle: "Artisan's Hub",          viewAllLabel: 'View All' },
];

export default function ExploreConsultantsScreen({ navigation }: any) {
  const profile = useAuthStore((s) => s.profile);

  const [hubs, setHubs] = useState<Record<Category, ConsultantProfile[]>>({
    Photographer: [], Designer: [], Artist: [], Artisan: [],
  });
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchHubs(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHubs().finally(() => setRefreshing(false));
  }, []);

  async function fetchHubs() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('consultant_profiles')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(60);

      const map: Record<Category, ConsultantProfile[]> = {
        Photographer: [], Designer: [], Artist: [], Artisan: [],
      };
      (data ?? []).forEach((c: ConsultantProfile) => {
        const e = (c.expertise ?? '').toLowerCase();
        if (e.includes('photo'))                         map.Photographer.push(c);
        else if (e.includes('design'))                   map.Designer.push(c);
        else if (e.includes('artisan') || e.includes('craft')) map.Artisan.push(c);
        else if (e.includes('art') || e.includes('illustr'))   map.Artist.push(c);
      });
      setHubs(map);
    } catch {}
    finally { setLoading(false); }
  }

  function goToCategory(category: Category) {
    navigation.navigate('ConsultantMatching', { preFilterCategory: category });
  }

  function goToProfile(c: ConsultantProfile) {
    navigation.navigate('CreatorProfile', { consultant: c });
  }

  // ── "Creators in Demand" = all categories flattened, take top featured ──
  const allConsultants = [
    ...hubs.Photographer, ...hubs.Designer, ...hubs.Artist, ...hubs.Artisan,
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Image
            source={{ uri: RemoteAssets.dcreatorsLogo }}
            style={s.logoIcon}
            resizeMode="contain"
          />
          <Text style={s.tagline}>HIRE CREATIVES. BUY ART. BUILD IDEAS</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Bell size={18} color={NAVY} />
          </TouchableOpacity>
          {profile?.avatar_url
            ? <Image source={{ uri: profile.avatar_url }} style={s.avatar} />
            : <View style={[s.avatar, s.avatarFallback]}>
                <Text style={s.avatarInit}>{(profile?.name ?? 'C').charAt(0).toUpperCase()}</Text>
              </View>
          }
        </View>
      </View>

      {/* ── Category icon tabs ──────────────────────────── */}
      <View style={s.catTabRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={s.catTab}
            onPress={() => goToCategory(cat.key)}
            activeOpacity={0.75}
          >
            <View style={s.catIconWrap}>
              <cat.Icon size={24} color={NAVY} strokeWidth={1.8} />
            </View>
            <Text style={s.catLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />}
      >
        {/* ── Section heading ─────────────────────────── */}
        <Text style={s.pageTitle}>Explore Creative Consultant's Portfolio</Text>

        {loading ? (
          <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* ── "Creators in Demand" section ─────────── */}
            <HubSection
              title="Creators in Demand"
              consultants={allConsultants}
              onViewAll={() => navigation.navigate('ConsultantMatching')}
              onPressItem={goToProfile}
              accentColor={ORANGE}
            />

            {/* ── Per-category sections ─────────────────── */}
            {CATEGORIES.map((cat) => (
              <HubSection
                key={cat.key}
                title={cat.sectionTitle}
                consultants={hubs[cat.key]}
                onViewAll={() => goToCategory(cat.key)}
                onPressItem={goToProfile}
                accentColor={NAVY}
              />
            ))}
          </>
        )}

        {/* ── Bottom dashboard shortcuts ──────────────── */}
        <View style={s.bottomNav}>
          <TouchableOpacity
            style={s.bottomNavBtn}
            onPress={() => navigation.navigate('Dashboard')}
            activeOpacity={0.8}
          >
            <Text style={s.bottomNavText}>Sales Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.bottomNavBtn, s.bottomNavBtnActive]}
            onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}
            activeOpacity={0.8}
          >
            <Text style={[s.bottomNavText, s.bottomNavTextActive]}>Project Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          A Joint Venture of Ishisoft Pvt.Ltd, Mr. Shoumik Mazumder and{'\n'}
          Design & Animation Club, Department of Visual Arts, AUS{'\n'}
          Honorary Design Mentor — Dr. Gautam Dutta, Department of Visual Arts, AUS
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── HubSection subcomponent ──────────────────────────────────
function HubSection({
  title, consultants, onViewAll, onPressItem, accentColor,
}: {
  title: string;
  consultants: ConsultantProfile[];
  onViewAll: () => void;
  onPressItem: (c: ConsultantProfile) => void;
  accentColor: string;
}) {
  const featured = consultants[0];

  return (
    <View style={s.hubSection}>
      {/* Section header row */}
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { color: accentColor }]}>{title}</Text>
        <TouchableOpacity style={s.viewAllBtn} onPress={onViewAll} activeOpacity={0.75}>
          <Text style={s.viewAllText}>View All</Text>
          <ArrowRight size={13} color={NAVY} />
        </TouchableOpacity>
      </View>

      {/* Featured card */}
      <TouchableOpacity
        style={s.featuredCard}
        onPress={() => featured && onPressItem(featured)}
        activeOpacity={0.9}
        disabled={!featured}
      >
        {(featured?.portfolio_banner_image || featured?.portfolio_images?.[0]) ? (
          <Image
            source={{ uri: featured.portfolio_banner_image || featured.portfolio_images![0] }}
            style={s.featuredImg}
            resizeMode="cover"
          />
        ) : (
          <View style={[s.featuredImg, s.featuredImgEmpty]}>
            <Users size={44} color="rgba(255,255,255,0.35)" />
          </View>
        )}

        {/* Consultant chip at bottom-left */}
        {featured && (
          <View style={s.chip}>
            {featured.avatar_url
              ? <Image source={{ uri: featured.avatar_url }} style={s.chipAvatar} />
              : <View style={[s.chipAvatar, s.chipAvatarFb]}>
                  <Text style={s.chipAvatarInitial}>{featured.display_name?.charAt(0).toUpperCase()}</Text>
                </View>
            }
            <View>
              <Text style={s.chipName}>{featured.display_name}</Text>
              <Text style={s.chipCode}>#{featured.code} 01</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoIcon: { width: 80, height: 32 },
  tagline: { fontSize: 8, fontFamily: fonts.body, color: colors.textTertiary, letterSpacing: 1.2, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center',
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  avatarInit: { color: '#fff', fontSize: 14, fontWeight: '800', fontFamily: fonts.heavy },

  // Category tab row
  catTabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  catTab: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  catIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Scroll
  scroll: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },

  // Page title
  pageTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '900',
    fontFamily: fonts.heavy,
    color: NAVY,
    lineHeight: 28,
    marginTop: 12,
    marginBottom: 16,
  },

  // Hub section
  hubSection: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: fontSizes.lg + 1,
    fontWeight: '800',
    fontFamily: fonts.heavy,
  },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewAllText: {
    fontSize: fontSizes.sm + 1,
    fontWeight: '700',
    fontFamily: fonts.heavy,
    color: NAVY,
  },

  // Featured image card
  featuredCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  featuredImg: {
    width: '100%',
    height: 200,
    backgroundColor: '#CBD5E1',
  },
  featuredImgEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Chip overlay
  chip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipAvatar: { width: 28, height: 28, borderRadius: 14 },
  chipAvatarFb: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  chipAvatarInitial: { color: '#fff', fontSize: 11, fontWeight: '800', fontFamily: fonts.heavy },
  chipName: { fontSize: 12, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY },
  chipCode: { fontSize: 10, fontFamily: fonts.body, color: colors.textTertiary },

  // Bottom nav shortcuts
  bottomNav: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 16 },
  bottomNavBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', backgroundColor: '#E5E7EB',
  },
  bottomNavBtnActive: { backgroundColor: NAVY },
  bottomNavText: {
    fontSize: fontSizes.sm + 1, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY,
  },
  bottomNavTextActive: { color: '#fff' },

  // Footer
  footer: {
    fontSize: 9, fontFamily: fonts.body, color: colors.textTertiary,
    textAlign: 'center', lineHeight: 14, marginTop: 8,
  },
});


