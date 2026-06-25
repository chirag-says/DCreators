/**
 * ExploreConsultantsScreen  (Phase 6.1)
 * Figma: CLIENT_DISCOVER_CONSULTANTS_SCREEN.png
 * "Explore Creative Consultant's Portfolio"
 * — Hero heading + subtitle
 * — View All shortcut
 * — 4 category hub cards with featured image + consultant info
 *   • Photographer's Archive
 *   • Designer's Hub
 *   • Artist's Gallery
 *   • Artisan's Hub
 * — Bottom nav: Sales Dashboard | Project Dashboard
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ArrowRight, Users } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing } from '../styles/theme';
import type { ConsultantProfile } from '../types';

const NAVY   = '#1B3A5C';
const ORANGE = '#E87B35';
const TEAL   = '#3D9B8F';
const BG     = '#F7F8FA';

type Category = 'Photographer' | 'Designer' | 'Artist' | 'Artisan';

const HUB_META: { category: Category; title: string; subtitle: string; btnLabel: string }[] = [
  { category: 'Photographer', title: "Photographer's Archive",  subtitle: 'Capture the moments with Pro Photographers', btnLabel: 'Browse Archives' },
  { category: 'Designer',     title: "Designer's Hub",          subtitle: 'Elevate your brand with Pro Designers',     btnLabel: 'Browse Hub'     },
  { category: 'Artist',       title: "Artist's Gallery",        subtitle: 'Explore the fine creations',                btnLabel: 'Browse Hub'     },
  { category: 'Artisan',      title: "Artisan's Hub",           subtitle: 'Discover the exquisite collection',         btnLabel: 'Browse Hub'     },
];

export default function ExploreConsultantsScreen({ navigation }: any) {
  const profile = useAuthStore(s => s.profile);

  // One representative consultant + avatar stack per category
  const [hubs, setHubs] = useState<Record<Category, ConsultantProfile[]>>({
    Photographer: [], Designer: [], Artist: [], Artisan: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHubs(); }, []);

  async function fetchHubs() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('consultant_profiles')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .in('expertise', ['Photographer', 'Designer', 'Artist', 'Artisan',
                          'Photography', 'Design', 'Illustration'])
        .order('created_at', { ascending: false })
        .limit(40);

      const map: Record<Category, ConsultantProfile[]> = {
        Photographer: [], Designer: [], Artist: [], Artisan: [],
      };
      (data ?? []).forEach((c: ConsultantProfile) => {
        const e = (c.expertise ?? '').toLowerCase();
        if (e.includes('photo'))   map.Photographer.push(c);
        else if (e.includes('design')) map.Designer.push(c);
        else if (e.includes('art'))    map.Artist.push(c);
        else if (e.includes('artisan')||e.includes('craft')) map.Artisan.push(c);
      });
      setHubs(map);
    } catch {}
    finally { setLoading(false); }
  }

  function navigateToCategory(category: Category) {
    navigation.navigate('ConsultantMatching', { preFilterCategory: category });
  }

  function navigateToConsultantProfile(c: ConsultantProfile) {
    navigation.navigate('CreatorProfile', { consultant: c });
  }

  function AvatarStack({ consultants }: { consultants: ConsultantProfile[] }) {
    const shown = consultants.slice(0, 4);
    return (
      <View style={s.avatarStack}>
        {shown.map((c, i) => (
          c.avatar_url
            ? <Image key={c.id} source={{ uri: c.avatar_url }} style={[s.stackAvatar, { left: i * 22 }]} />
            : <View key={c.id} style={[s.stackAvatar, s.stackAvatarFallback, { left: i * 22 }]}>
                <Text style={s.stackAvatarInit}>{c.display_name.charAt(0).toUpperCase()}</Text>
              </View>
        ))}
        {consultants.length > 4 && (
          <View style={[s.stackAvatar, s.stackAvatarMore, { left: 4 * 22 }]}>
            <Text style={s.stackAvatarMoreText}>+{consultants.length - 4}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.tagline}>HIRE CREATIVES. BUY ART. BUILD IDEAS</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Notifications')} activeOpacity={0.7}>
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

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.heroRow}>
          <Text style={s.heroTitle}>Explore{'\n'}Creative{'\n'}Consultant's{'\n'}Portfolio</Text>
          <TouchableOpacity
            style={s.viewAllBtn}
            onPress={() => navigation.navigate('ConsultantMatching')}
            activeOpacity={0.8}
          >
            <Text style={s.viewAllText}>View All</Text>
            <ArrowRight size={14} color={TEAL} />
          </TouchableOpacity>
        </View>
        <Text style={s.heroSub}>
          Connect with Creative consultants, (Photographer, Designer, Artists, and Artisans) to bring your most ambitious projects to life.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 40 }} />
        ) : (
          HUB_META.map((hub) => {
            const consultants = hubs[hub.category];
            const featured    = consultants[0];

            return (
              <View key={hub.category} style={s.hubCard}>
                {/* Featured image / hero area */}
                <TouchableOpacity
                  style={s.featuredWrap}
                  onPress={() => featured && navigateToConsultantProfile(featured)}
                  activeOpacity={0.92}
                >
                  {featured?.portfolio_images?.[0] ? (
                    <Image source={{ uri: featured.portfolio_images[0] }} style={s.featuredImg} />
                  ) : (
                    <View style={[s.featuredImg, s.featuredImgPlaceholder]}>
                      <Users size={40} color="rgba(255,255,255,0.4)" />
                    </View>
                  )}
                  {/* Consultant chip overlay */}
                  {featured && (
                    <View style={s.featuredChip}>
                      {featured.avatar_url
                        ? <Image source={{ uri: featured.avatar_url }} style={s.chipAvatar} />
                        : <View style={[s.chipAvatar, s.chipAvatarFallback]}>
                            <Text style={s.chipAvatarInit}>{featured.display_name.charAt(0).toUpperCase()}</Text>
                          </View>
                      }
                      <View>
                        <Text style={s.chipName}>{featured.display_name}</Text>
                        <Text style={s.chipCode}>#{featured.code}</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Hub info */}
                <View style={s.hubInfo}>
                  <Text style={s.hubTitle}>{hub.title}</Text>
                  <Text style={s.hubSubtitle}>{hub.subtitle}</Text>
                  <View style={s.hubFooter}>
                    <TouchableOpacity
                      style={s.browseBtn}
                      onPress={() => navigateToCategory(hub.category)}
                      activeOpacity={0.85}
                    >
                      <Text style={s.browseBtnText}>{hub.btnLabel}</Text>
                    </TouchableOpacity>
                    <AvatarStack consultants={consultants} />
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Bottom shortcuts */}
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
            onPress={() => navigation.navigate('ConsultantProjectCollaboration', { project: null })}
            activeOpacity={0.8}
          >
            <Text style={[s.bottomNavText, s.bottomNavTextActive]}>Project Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  tagline: { fontSize: 9, fontFamily: fonts.body, color: colors.textTertiary, letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  avatarInit: { color: '#fff', fontSize: 14, fontWeight: '800', fontFamily: fonts.heavy },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  // Hero
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 10 },
  heroTitle: { fontSize: 34, fontWeight: '900', fontFamily: fonts.heavy, color: NAVY, lineHeight: 40 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  viewAllText: { fontSize: fontSizes.sm + 1, fontWeight: '700', fontFamily: fonts.heavy, color: TEAL },
  heroSub: { fontSize: fontSizes.sm + 1, fontFamily: fonts.body, color: colors.textSecondary, lineHeight: 20, marginTop: 10, marginBottom: 22 },
  // Hub card
  hubCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#EAEAEA' },
  featuredWrap: { position: 'relative' },
  featuredImg: { width: '100%', height: 200 },
  featuredImgPlaceholder: { backgroundColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  featuredChip: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 30, paddingHorizontal: 10, paddingVertical: 6 },
  chipAvatar: { width: 28, height: 28, borderRadius: 14 },
  chipAvatarFallback: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  chipAvatarInit: { color: '#fff', fontSize: 11, fontWeight: '800', fontFamily: fonts.heavy },
  chipName: { fontSize: fontSizes.xs + 1, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY },
  chipCode: { fontSize: fontSizes.xs, fontFamily: fonts.body, color: colors.textTertiary },
  hubInfo: { padding: 16 },
  hubTitle: { fontSize: fontSizes.xl, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY, marginBottom: 4 },
  hubSubtitle: { fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textSecondary, lineHeight: 20, marginBottom: 14 },
  hubFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  browseBtn: { backgroundColor: ORANGE, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 },
  browseBtnText: { color: '#fff', fontSize: fontSizes.sm + 1, fontWeight: '700', fontFamily: fonts.heavy },
  // Avatar stack
  avatarStack: { flexDirection: 'row', height: 32, position: 'relative', width: 120 },
  stackAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#fff', position: 'absolute' },
  stackAvatarFallback: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  stackAvatarInit: { color: '#fff', fontSize: 11, fontWeight: '800', fontFamily: fonts.heavy },
  stackAvatarMore: { backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  stackAvatarMoreText: { color: '#fff', fontSize: 9, fontWeight: '800', fontFamily: fonts.heavy },
  // Bottom nav
  bottomNav: { flexDirection: 'row', gap: 12, marginTop: 8 },
  bottomNavBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#E5E7EB' },
  bottomNavBtnActive: { backgroundColor: NAVY },
  bottomNavText: { fontSize: fontSizes.sm + 1, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY },
  bottomNavTextActive: { color: '#fff' },
});
