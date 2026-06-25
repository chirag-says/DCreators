// ============================================
// ClientDashboard — "Explore Creative Consultant's Portfolio"
// Role: CLIENT | Figma: "Explore Creative Consultant's Portfolio.png"
// 5 creator browse sections + active projects summary
// ============================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../TopHeader';
import SkeletonBar from '../common/SkeletonBar';
import CreatorCard from './CreatorCard';
import ClientProjectRow from './ClientProjectRow';
import type { CardStyle } from './CreatorCard';
import { useCreators } from '../../hooks/useCreators';
import { useClientProjects } from '../../hooks/useProjects';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii } from '../../styles/theme';
import type { CreatorCardViewModel, MainTabScreenProps } from '../../types/navigation';
import type { ProjectWithConsultant } from '../../services/projectService';
import { RemoteAssets } from '../../lib/assets';


// ─── Figma color tokens ──────────────────────────────────────
const NAVY = '#1B3A5C';

interface ClientDashboardProps {
  navigation: MainTabScreenProps<'Dashboard'>['navigation'];
}



// Section configuration for the creator browsing cards
const SECTIONS = [
  {
    title: 'Creators in Demand',
    category: null as string | null,
    headerBg: '#4D4D4D',
    headerBorderColor: '#5a5a5a',
    headerTextStyle: 'yellow' as const,
    scrollBg: '#595959',
    cardStyle: 'card' as CardStyle,
    labelColors: ['#A64B3B', '#00A346', '#6B21A8', '#E03A5F'],
  },
  {
    title: "Photographer's Archive",
    category: 'photographer',
    headerBg: '#1A1A1A',
    headerBorderColor: '#000000',
    headerTextStyle: 'gray' as const,
    scrollBg: '#000000',
    cardStyle: 'archive' as CardStyle,
    labelColors: ['#F28220', '#A4A767', '#A35165'],
  },
  {
    title: "Designer's Desk",
    category: 'designer',
    headerBg: '#4E3F30',
    headerBorderColor: '#30261A',
    headerTextStyle: 'light' as const,
    scrollBg: '#5C4F40',
    cardStyle: 'hub' as CardStyle,
    labelColors: ['#A7A965', '#EE1F3E', '#009BD9'],
  },
  {
    title: "Artist's Gallery",
    category: 'sculptor',
    headerBg: '#2C3E50',
    headerBorderColor: '#1A2535',
    headerTextStyle: 'gray' as const,
    scrollBg: '#34495E',
    cardStyle: 'archive' as CardStyle,
    labelColors: ['#7FB3D3', '#E8A87C', '#82E0AA'],
  },
  {
    title: "Artisan's Hub",
    category: 'artisan',
    headerBg: '#6B4C2A',
    headerBorderColor: '#4A3218',
    headerTextStyle: 'light' as const,
    scrollBg: '#7D5A35',
    cardStyle: 'card' as CardStyle,
    labelColors: ['#F4D03F', '#E59866', '#A9DFBF'],
  },
];

const HEADER_STYLES: Record<string, { color: string }> = {
  yellow: { color: '#FACC15' },
  gray: { color: '#D1D5DB' },
  light: { color: '#E5E7EB' },
};

export default function ClientDashboard({ navigation }: ClientDashboardProps) {
  const profile = useAuthStore((s) => s.profile);
  const { creators, loading: creatorsLoading, error: creatorsError, refresh: refreshCreators } = useCreators();
  const { projects: clientProjects, loading: projectsLoading, refresh: refreshProjects } = useClientProjects(profile?.id);

  const onRefresh = useCallback(async () => {
    await Promise.all([refreshCreators(), refreshProjects()]);
  }, [refreshCreators, refreshProjects]);

  function getCreatorsForSection(section: typeof SECTIONS[0]): CreatorCardViewModel[] {
    if (!section.category) {
      // "Creators in Demand" — first 4 unique categories
      const seen = new Set<string>();
      return creators.filter((c) => {
        if (seen.has(c.category)) return false;
        seen.add(c.category);
        return true;
      }).slice(0, 4);
    }
    return creators.filter((c) => c.category === section.category);
  }

  function goToProfile(creator: CreatorCardViewModel) {
    navigation.navigate('CreatorProfile', { creator });
  }

  function goToWorkorder(project: ProjectWithConsultant) {
    const s = project.status;
    // Spec-driven routing based on current project state
    if (s === 'advance_pending') {
      // Client needs to pay advance
      (navigation as any).navigate('Payment', { project, paymentType: 'advance' });
    } else if (s === 'advance_paid') {
      // Client should generate work order
      (navigation as any).navigate('GenerateWorkOrder', { project, txnId: '', payAmount: project.final_offer ?? project.budget });
    } else {
      // in_progress, review_1, review_2, final_review, final_approved, balance_pending, balance_paid, delivered, completed
      (navigation as any).navigate('ClientWorkorder', { project });
    }
  }



  return (
    <ImageBackground source={{ uri: RemoteAssets.bgTexture }} style={styles.bg} imageStyle={{ opacity: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TopHeader />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <View style={styles.container}>
            {/* ── Welcome Header ──────────────────── */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeGreeting}>Welcome back,</Text>
              <Text style={styles.welcomeName}>{profile?.name || 'Client'}</Text>
              <Text style={styles.welcomeTagline}>Hire Creatives. Buy Art. Build Ideas.</Text>
            </View>

            {/* Error Banner */}
            {creatorsError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠ {creatorsError}</Text>
              </View>
            )}

            {/* Client Active Projects */}
            {clientProjects.length > 0 && (
              <View style={styles.projectsSection}>
                <View style={styles.projectsHeader}>
                  <Text style={styles.projectsTitle}>My Active Projects</Text>
                  <Text style={styles.projectsCount}>{clientProjects.length}</Text>
                </View>
                {clientProjects.map((proj) => (
                  <ClientProjectRow key={proj.id} project={proj} onPress={goToWorkorder} />
                ))}
              </View>
            )}

            {/* Creator Sections */}
            {creatorsLoading ? (
              <>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={styles.sectionBox}>
                    <View style={[styles.sectionHeader, { backgroundColor: '#4D4D4D' }]}>
                      <SkeletonBar width={160} height={16} />
                    </View>
                    <View style={{ backgroundColor: '#595959', flexDirection: 'row', padding: 8, gap: 8 }}>
                      {[0, 1, 2].map((j) => (
                        <SkeletonBar key={j} width={140} height={130} borderRadius={8} />
                      ))}
                    </View>
                  </View>
                ))}
              </>
            ) : (
              SECTIONS.map((section) => {
                const sectionCreators = getCreatorsForSection(section);
                return (
                  <View key={section.title} style={styles.sectionBox}>
                    <View style={[styles.sectionHeader, { backgroundColor: section.headerBg, borderBottomColor: section.headerBorderColor }]}>
                      <Text style={[styles.headerText, HEADER_STYLES[section.headerTextStyle]]}>{section.title}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={{ backgroundColor: section.scrollBg }}>
                      {sectionCreators.map((c, i) => (
                        <CreatorCard
                          key={c.id}
                          creator={c}
                          cardStyle={section.cardStyle}
                          labelBg={section.labelColors[i % section.labelColors.length]}
                          showCategoryChip={section.cardStyle === 'card'}
                          onPress={goToProfile}
                        />
                      ))}
                    </ScrollView>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0, gap: 16 },

  // ── Welcome header ─────────────────────────────
  welcomeSection: {
    marginBottom: spacing.lg,
  },
  welcomeGreeting: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.textSecondary,
  },
  welcomeName: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: fonts.heavy,
    color: NAVY,
    lineHeight: 38,
    marginTop: 2,
  },
  welcomeTagline: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },

  // ── Error ─────────────────────────────────────
  errorBanner: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 8, padding: 12,
  },
  errorText: { color: '#DC2626', fontSize: 13, fontFamily: fonts.body },

  // ── Projects section ──────────────────────────
  projectsSection: {
    marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  projectsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  projectsTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  projectsCount: {
    fontSize: 13, fontWeight: '700', color: '#6B7280',
    backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10,
  },

  // ── Creator sections ──────────────────────────
  sectionBox: {
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(163,163,163,0.6)', marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  sectionHeader: {
    paddingVertical: 10, alignItems: 'center', borderBottomWidth: 1,
  },
  headerText: {
    fontWeight: '700', fontSize: 15, fontFamily: fonts.medium,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  scrollContent: { padding: 10, gap: 10 },
});
