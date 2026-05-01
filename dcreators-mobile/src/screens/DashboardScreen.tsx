import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Animated, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../components/TopHeader';
import CloudImage from '../components/CloudImage';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Clock, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

// Category-to-local-fallback-avatar mapping (used when consultant has no avatar_url)
const CATEGORY_FALLBACK_AVATAR: Record<string, string> = {
  photographer: 'dcreators/photographer',
  designer: 'dcreators/designer',
  sculptor: 'dcreators/sculptor',
  artisan: 'dcreators/artisan',
};

// Local image fallback map (when Cloudinary isn't configured yet)
const LOCAL_IMAGES: Record<string, any> = {
  'dcreators/photographer': require('../../assets/photographer.png'),
  'dcreators/designer': require('../../assets/designer.png'),
  'dcreators/sculptor': require('../../assets/sculptor.png'),
  'dcreators/artisan': require('../../assets/artisan.png'),
  'dcreators/photo_archive_1': require('../../assets/photo_archive_1.png'),
  'dcreators/photo_archive_2': require('../../assets/photo_archive_2.png'),
  'dcreators/photo_archive_3': require('../../assets/photo_archive_3.png'),
  'dcreators/design_hub_1': require('../../assets/design_hub_1.png'),
  'dcreators/design_hub_2': require('../../assets/design_hub_2.png'),
  'dcreators/design_hub_3': require('../../assets/design_hub_3.png'),
};

// Section config for dashboard categories
const SECTIONS = [
  {
    title: 'Creators in Demand',
    category: null, // show first 4 (mixed categories)
    headerBg: '#4D4D4D',
    headerBorderColor: '#5a5a5a',
    headerTextStyle: 'yellow' as const,
    scrollBg: '#595959',
    cardStyle: 'card' as const,
    labelColors: ['#A64B3B', '#00A346', '#6B21A8', '#E03A5F'],
  },
  {
    title: "Photographer's Archive",
    category: 'photographer',
    headerBg: '#1A1A1A',
    headerBorderColor: '#000000',
    headerTextStyle: 'gray' as const,
    scrollBg: '#000000',
    cardStyle: 'archive' as const,
    labelColors: ['#F28220', '#A4A767', '#A35165'],
  },
  {
    title: "Designer's Hub",
    category: 'designer',
    headerBg: '#4E3F30',
    headerBorderColor: '#30261A',
    headerTextStyle: 'light' as const,
    scrollBg: '#5C4F40',
    cardStyle: 'hub' as const,
    labelColors: ['#A7A965', '#EE1F3E', '#009BD9'],
  },
];

const HEADER_STYLES: Record<string, any> = {
  yellow: { color: '#FACC15' },
  gray: { color: '#D1D5DB' },
  light: { color: '#E5E7EB' },
};

export default function DashboardScreen({ navigation }: any) {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [useCloudinary, setUseCloudinary] = useState(false);
  const currentRole = useAuthStore((s) => s.currentRole);
  const profile = useAuthStore((s) => s.profile);
  const consultantProfile = useAuthStore((s) => s.consultantProfile);

  // Consultant state
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Client state
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [clientProjectsLoading, setClientProjectsLoading] = useState(false);

  useEffect(() => {
    if (currentRole === 'consultant') {
      fetchMyProjects();
    } else {
      fetchCreators();
      fetchClientProjects();
    }
  }, [currentRole]);

  async function fetchCreators() {
    try {
      const { data, error } = await supabase
        .from('consultant_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const profiles = data.map((cp: any) => ({
          id: cp.id,
          name: cp.display_name,
          code: cp.code,
          subtitle: cp.subtitle || '',
          experience: cp.experience || '',
          expertise: cp.expertise || '',
          avatar_public_id: cp.avatar_url || CATEGORY_FALLBACK_AVATAR[cp.category] || 'dcreators/designer',
          category: cp.category,
          base_price: cp.base_price,
          is_approved: cp.is_approved,
          user_id: cp.user_id,
        }));
        setCreators(profiles);
      } else {
        setCreators([]);
      }
      setUseCloudinary(false);
    } catch {
      setCreators([]);
      setUseCloudinary(false);
    } finally {
      setLoading(false);
    }
  }

  function getCreatorsForSection(section: typeof SECTIONS[0]) {
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

  function goToProfile(creator: any) {
    navigation.navigate('CreatorProfile', { creator });
  }

  function renderCard(creator: any, section: typeof SECTIONS[0], index: number) {
    const labelBg = section.labelColors[index % section.labelColors.length];
    const isHub = section.cardStyle === 'hub';
    const isMainCard = section.cardStyle === 'card';
    const cardS = isMainCard ? styles.card : section.cardStyle === 'archive' ? styles.cardArchive : styles.cardHub;
    const borderR = isMainCard ? 10 : 8;
    const categoryLabel = creator.category.charAt(0).toUpperCase() + creator.category.slice(1);

    const cardContent = (
      <>
        {/* No overlay — clean image */}

        {/* Category chip — top left (only for Creators in Demand) */}
        {isMainCard && (
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{categoryLabel}</Text>
          </View>
        )}

        {/* Name pill — bottom */}
        <View style={styles.labelPillContainer}>
          <View style={[styles.labelPill, { backgroundColor: labelBg }]}>
            <Text style={styles.labelPillText}>
              {creator.code}/{creator.name.split(' ')[0]}
            </Text>
          </View>
        </View>
      </>
    );

    return (
      <TouchableOpacity key={creator.id} activeOpacity={0.85} onPress={() => goToProfile(creator)} style={styles.cardShadow}>
        {useCloudinary ? (
          <View style={cardS}>
            <CloudImage
              publicId={creator.avatar_public_id}
              width={isMainCard ? 155 : 145}
              height={isMainCard ? 175 : 145}
              borderRadius={borderR}
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
            {cardContent}
          </View>
        ) : (
          <ImageBackground
            source={LOCAL_IMAGES[creator.avatar_public_id]}
            style={cardS}
            imageStyle={{ borderRadius: borderR }}
            resizeMode="cover"
          >
            {cardContent}
          </ImageBackground>
        )}
      </TouchableOpacity>
    );
  }

  // --- Consultant: fetch assigned projects ---
  async function fetchMyProjects() {
    setProjectsLoading(true);
    try {
      if (!consultantProfile?.id) {
        setMyProjects([]);
        return;
      }
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('consultant_id', consultantProfile.id)
        .in('status', ['pending', 'accepted', 'advance_paid', 'in_progress', 'review_1', 'review_2', 'final_review'])
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMyProjects(data);
      }
    } catch {
      // Silently fail
    } finally {
      setProjectsLoading(false);
    }
  }

  // --- Client: fetch my assigned projects ---
  async function fetchClientProjects() {
    if (!profile?.id) return;
    setClientProjectsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, consultant_profiles(display_name, code)')
        .eq('client_id', profile.id)
        .in('status', ['pending', 'accepted', 'advance_paid', 'in_progress', 'review_1', 'review_2', 'final_review', 'approved'])
        .order('created_at', { ascending: false });
      if (!error && data) setClientProjects(data);
    } catch {}
    finally { setClientProjectsLoading(false); }
  }

  async function handleProjectAction(projectId: string, action: 'accepted' | 'rejected') {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: action, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      Alert.alert('Done', action === 'accepted' ? 'Project accepted! Set your timeline.' : 'Project rejected.');
      fetchMyProjects(); // Refresh
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  }

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pending', color: colors.warning, icon: Clock },
    accepted: { label: 'Accepted', color: colors.success, icon: CheckCircle },
    advance_paid: { label: 'Advance Paid', color: colors.info, icon: CheckCircle },
    in_progress: { label: 'In Progress', color: '#8B5CF6', icon: FileText },
    review_1: { label: 'Review 1', color: '#EC4899', icon: AlertCircle },
    review_2: { label: 'Review 2', color: '#EC4899', icon: AlertCircle },
    final_review: { label: 'Final Review', color: colors.error, icon: AlertCircle },
  };

  // ======== CONSULTANT DASHBOARD ========
  if (currentRole === 'consultant') {
    return (
      <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.backgroundImage} imageStyle={{ opacity: 1 }}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <TopHeader />
          <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <Text style={styles.consultantGreeting}>Welcome back,</Text>
              <Text style={styles.consultantName}>{consultantProfile?.display_name || profile?.name || 'Consultant'}</Text>
              <Text style={styles.consultantCode}>{consultantProfile?.code || ''} · {consultantProfile?.category?.charAt(0).toUpperCase()}{consultantProfile?.category?.slice(1) || ''}</Text>

              <View style={styles.projectsHeader}>
                <Text style={styles.projectsTitle}>My Assignments</Text>
                <Text style={styles.projectsCount}>{myProjects.length} active</Text>
              </View>

              {projectsLoading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
              ) : myProjects.length === 0 ? (
                <View style={styles.emptyState}>
                  <FileText size={48} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>No assignments yet</Text>
                  <Text style={styles.emptySubtitle}>Projects assigned to you will appear here</Text>
                </View>
              ) : (
                myProjects.map((project) => {
                  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <View key={project.id} style={styles.projectCard}>
                      <View style={styles.projectCardHeader}>
                        <View style={[styles.statusBadge, { backgroundColor: statusCfg.color }]}>
                          <StatusIcon size={12} color="#FFF" />
                          <Text style={styles.statusBadgeText}>{statusCfg.label}</Text>
                        </View>
                        <Text style={styles.projectDate}>
                          {new Date(project.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>

                      <Text style={styles.projectType}>{project.assignment_type.charAt(0).toUpperCase() + project.assignment_type.slice(1)}</Text>
                      <Text style={styles.projectBrief} numberOfLines={2}>{project.assignment_brief}</Text>

                      <View style={styles.projectMeta}>
                        <Text style={styles.projectBudget}>₹{Number(project.budget).toLocaleString()}</Text>
                        {project.deadline && <Text style={styles.projectDeadline}>Due: {project.deadline}</Text>}
                      </View>

                      {/* Accept / Reject buttons for pending projects */}
                      {project.status === 'pending' && (
                        <View style={styles.projectActions}>
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => Alert.alert('Reject?', 'Are you sure?', [
                              { text: 'Cancel' },
                              { text: 'Reject', style: 'destructive', onPress: () => handleProjectAction(project.id, 'rejected') },
                            ])}
                          >
                            <XCircle size={16} color="#EF4444" />
                            <Text style={styles.rejectBtnText}>Reject</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.acceptProjectBtn}
                            onPress={() => handleProjectAction(project.id, 'accepted')}
                          >
                            <CheckCircle size={16} color="#FFF" />
                            <Text style={styles.acceptProjectBtnText}>Accept</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* View workorder for accepted+ projects */}
                      {project.status !== 'pending' && (
                        <TouchableOpacity
                          style={styles.viewOrderBtn}
                          onPress={() => navigation.navigate('CreatorWorkorder', { project })}
                        >
                          <Text style={styles.viewOrderBtnText}>View Workorder →</Text>
                        </TouchableOpacity>
                      )}
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

  // ======== CLIENT DASHBOARD (existing) ========
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

            {/* Client Active Projects */}
            {clientProjects.length > 0 && (
              <View style={styles.clientProjectsSection}>
                <View style={styles.clientProjectsHeader}>
                  <Text style={styles.clientProjectsTitle}>My Active Projects</Text>
                  <Text style={styles.clientProjectsCount}>{clientProjects.length}</Text>
                </View>
                {clientProjects.map((proj) => {
                  const cfg = STATUS_CONFIG[proj.status] || STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <TouchableOpacity
                      key={proj.id}
                      style={styles.clientProjectCard}
                      onPress={() => navigation.navigate('ClientWorkorder', { project: proj })}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.clientProjectType}>
                          {proj.assignment_type?.charAt(0).toUpperCase()}{proj.assignment_type?.slice(1) || 'Project'}
                        </Text>
                        <Text style={styles.clientProjectConsultant}>
                          {proj.consultant_profiles?.display_name || 'Consultant'} / {proj.consultant_profiles?.code || '---'}
                        </Text>
                      </View>
                      <View style={[styles.clientStatusChip, { backgroundColor: cfg.color + '18', borderColor: cfg.color }]}>
                        <StatusIcon size={12} color={cfg.color} />
                        <Text style={[styles.clientStatusText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {loading ? (
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
                      {sectionCreators.map((c, i) => renderCard(c, section, i))}
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

/** Simple skeleton placeholder bar */
function SkeletonBar({ width, height, borderRadius = 4 }: { width: number; height: number; borderRadius?: number }) {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#6B7280',
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] }),
      }}
    />
  );
}

const fontMedium = fonts.medium;
const fontBody = fonts.body;

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: colors.screenBg },
  safeArea: { flex: 1 },
  mainScroll: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0, gap: 16 },
  sectionBox: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(163,163,163,0.6)',
    marginBottom: 16,
    // Subtle shadow
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  sectionHeader: {
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerText: {
    fontWeight: '700',
    fontSize: 15,
    fontFamily: fontMedium,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  scrollContent: { padding: 10, gap: 10 },

  // Main cards (Creators in Demand)
  card: {
    width: 155,
    height: 175,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  // Archive cards
  cardArchive: {
    width: 145,
    height: 145,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  // Hub cards
  cardHub: {
    width: 145,
    height: 145,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cardShadow: {
    borderRadius: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },

  // Gradient overlay — two layers simulating bottom-to-top gradient
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    // Simulate gradient by layering
  },

  // Category chip (top-left badge)
  categoryChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryChipText: {
    color: '#FACC15',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: fontMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Name pill (bottom center)
  labelPillContainer: {
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  labelPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  labelPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fontMedium,
    letterSpacing: 0.3,
  },

  // ===== CONSULTANT DASHBOARD STYLES =====
  consultantGreeting: {
    fontSize: fontSizes.base,
    fontFamily: fontBody,
    color: colors.textSecondary,
  },
  consultantName: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  consultantCode: {
    fontSize: fontSizes.sm,
    fontFamily: fontBody,
    color: colors.textTertiary,
    marginBottom: spacing['2xl'],
  },
  projectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  projectsCount: {
    fontSize: 13,
    fontFamily: fontBody,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: fontBody,
    color: '#D1D5DB',
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  projectDate: {
    fontSize: 11,
    fontFamily: fontBody,
    color: '#9CA3AF',
  },
  projectType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  projectBrief: {
    fontSize: 13,
    fontFamily: fontBody,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectBudget: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  projectDeadline: {
    fontSize: 12,
    fontFamily: fontBody,
    color: '#F59E0B',
  },
  projectActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  acceptProjectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  acceptProjectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  viewOrderBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  viewOrderBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },

  // Client Projects Section
  clientProjectsSection: {
    marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  clientProjectsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  clientProjectsTitle: {
    fontSize: 15, fontWeight: '700', color: '#1F2937',
  },
  clientProjectsCount: {
    fontSize: 13, fontWeight: '700', color: '#6B7280',
    backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10,
  },
  clientProjectCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  clientProjectType: {
    fontSize: 14, fontWeight: '700', color: '#1F2937',
  },
  clientProjectConsultant: {
    fontSize: 11, color: '#6B7280', marginTop: 2,
  },
  clientStatusChip: {
    flexDirection: 'row', gap: 4, alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    borderWidth: 1,
  },
  clientStatusText: {
    fontSize: 10, fontWeight: '700',
  },
});
