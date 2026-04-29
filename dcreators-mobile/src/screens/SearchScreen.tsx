import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, ChevronLeft, User } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const fontMedium = fonts.medium;
const fontBody = fonts.body;
const fontHeavy = fonts.heavy;

const RECENT_SEARCHES = [
  'Branding', 'Web Design', 'Portrait', '3D Animation', 'Product Photo', 'Abstract Art', 'Logo Design'
];

const CATEGORY_FILTERS = [
  { label: 'All', value: null },
  { label: 'Photographer', value: 'photographer' },
  { label: 'Designer', value: 'designer' },
  { label: 'Sculptor', value: 'sculptor' },
  { label: 'Artisan', value: 'artisan' },
];

const CATEGORY_COLORS: Record<string, string> = {
  photographer: '#A64B3B',
  designer: colors.success,
  sculptor: '#6B21A8',
  artisan: colors.primary,
};

// Local images for fallback avatars
const LOCAL_IMAGES: Record<string, any> = {
  'dcreators/photographer': require('../../assets/photographer.png'),
  'dcreators/designer': require('../../assets/designer.png'),
  'dcreators/sculptor': require('../../assets/sculptor.png'),
  'dcreators/artisan': require('../../assets/artisan.png'),
};

export default function SearchScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search when query or category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 0 || selectedCategory) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 400); // Debounce 400ms

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Demo/fallback profiles for search (same as Dashboard)
  const DEMO_PROFILES = [
    { id: 'demo-1', display_name: 'Shoumik Sen', code: 'D101', subtitle: 'MFA Photography, Satyajit Ray Film & Television Institute', experience: '8 years', expertise: 'Wedding Photography, Cinematic Portraiture, Product Shoots', category: 'photographer', is_approved: true, base_price: 15000 },
    { id: 'demo-2', display_name: 'Rajdeep Das', code: 'D204', subtitle: 'BDes Communication Design, NID Ahmedabad', experience: '6 years', expertise: 'Brand Identity, UI/UX Design, Packaging Design', category: 'designer', is_approved: true, base_price: 20000 },
    { id: 'demo-3', display_name: 'Amit Ghosh', code: 'D312', subtitle: 'MFA Sculpture, Govt. College of Art & Craft, Kolkata', experience: '15 years', expertise: 'Bronze Casting, Public Installations, Stone Carving', category: 'sculptor', is_approved: true, base_price: 35000 },
    { id: 'demo-4', display_name: 'Ravi Sutradhar', code: 'D418', subtitle: 'National Award Winner, Shantiniketan Craft Collective', experience: '20 years', expertise: 'Terracotta Art, Dokra Casting, Traditional Pottery', category: 'artisan', is_approved: true, base_price: 12000 },
    { id: 'demo-5', display_name: 'Sudip Paul', code: 'D105', subtitle: 'MVA Applied Arts, Kala Bhavana, Visva-Bharati University', experience: '12 years', expertise: 'Fashion Photography, Art Direction, Editorial Shoots', category: 'photographer', is_approved: true, base_price: 25000 },
    { id: 'demo-6', display_name: 'Rahul Dey', code: 'D109', subtitle: 'PG Diploma, Sri Aurobindo Centre for Arts & Communication', experience: '5 years', expertise: 'Wildlife Photography, Travel Journalism, Photo Editing', category: 'photographer', is_approved: true, base_price: 10000 },
    { id: 'demo-7', display_name: 'Suita Roy', code: 'D211', subtitle: 'MDes Industrial Design, IIT Bombay (IDC School of Design)', experience: '4 years', expertise: 'Product Design, 3D Visualization, User Research', category: 'designer', is_approved: true, base_price: 18000 },
    { id: 'demo-8', display_name: 'Rajib Sarkar', code: 'D215', subtitle: 'BFA Applied Arts, Indian College of Arts & Draftsmanship', experience: '7 years', expertise: 'Graphic Design, Typography, Motion Graphics', category: 'designer', is_approved: true, base_price: 14000 },
  ];

  async function performSearch() {
    setIsSearching(true);
    try {
      // 1. Query Supabase for real profiles
      let query = supabase
        .from('consultant_profiles')
        .select('*')
        .eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.or(
          `display_name.ilike.%${searchQuery}%,expertise.ilike.%${searchQuery}%,subtitle.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.limit(20);
      const supabaseResults = (!error && data) ? data : [];

      // 2. Also filter demo profiles locally
      let demoResults = DEMO_PROFILES;

      if (selectedCategory) {
        demoResults = demoResults.filter(d => d.category === selectedCategory);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        demoResults = demoResults.filter(d =>
          d.display_name.toLowerCase().includes(q) ||
          d.expertise.toLowerCase().includes(q) ||
          d.subtitle.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
        );
      }

      // 3. Merge: real profiles first, then demos (avoid duplicates by code)
      const realCodes = new Set(supabaseResults.map((r: any) => r.code));
      const uniqueDemos = demoResults.filter(d => !realCodes.has(d.code));
      setResults([...supabaseResults, ...uniqueDemos]);

    } catch {
      // On error, still show demo results
      let demoResults = DEMO_PROFILES;
      if (selectedCategory) demoResults = demoResults.filter(d => d.category === selectedCategory);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        demoResults = demoResults.filter(d =>
          d.display_name.toLowerCase().includes(q) || d.expertise.toLowerCase().includes(q)
        );
      }
      setResults(demoResults);
    } finally {
      setIsSearching(false);
    }
  }

  function handleTagSearch(tag: string) {
    setSearchQuery(tag);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFF' }]} edges={['top']}>
      <ImageBackground 
        source={require('../../assets/bg-texture.png')} 
        style={styles.backgroundImage}
        imageStyle={{ opacity: 1 }}
      >
        {/* Search Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={28} color="#111" />
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search Consultants, Skills..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Filter')}>
            <SlidersHorizontal size={24} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CATEGORY_FILTERS.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[styles.categoryPill, selectedCategory === cat.value && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
            >
              <Text style={[styles.categoryPillText, selectedCategory === cat.value && styles.categoryPillTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 8 }}>
          <View style={styles.container}>
            
            {/* Recent Searches — shown when no query */}
            {!searchQuery && !selectedCategory && (
              <View style={styles.recentSection}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <View style={styles.tagsContainer}>
                  {RECENT_SEARCHES.map((tag, index) => (
                    <TouchableOpacity key={index} style={styles.tagPill} onPress={() => handleTagSearch(tag)}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Loading */}
            {isSearching && (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1B3A5C" />
              </View>
            )}

            {/* Results */}
            {!isSearching && results.length > 0 && (
              <View style={styles.resultsSection}>
                <Text style={styles.sectionTitle}>{results.length} Consultant{results.length > 1 ? 's' : ''} found</Text>
                {results.map((consultant) => (
                  <TouchableOpacity
                    key={consultant.id}
                    style={styles.resultCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('CreatorProfile', { creator: {
                      id: consultant.id,
                      name: consultant.display_name,
                      code: consultant.code,
                      subtitle: consultant.subtitle,
                      experience: consultant.experience,
                      expertise: consultant.expertise,
                      category: consultant.category,
                      base_price: consultant.base_price,
                      avatar_public_id: `dcreators/${consultant.category}`,
                    }})}
                  >
                    <View style={styles.resultAvatar}>
                      {LOCAL_IMAGES[`dcreators/${consultant.category}`] ? (
                        <Image source={LOCAL_IMAGES[`dcreators/${consultant.category}`]} style={styles.resultAvatarImg} />
                      ) : (
                        <User size={32} color="#9CA3AF" />
                      )}
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{consultant.display_name}</Text>
                      <Text style={styles.resultSub} numberOfLines={1}>{consultant.subtitle || consultant.expertise}</Text>
                      <View style={styles.resultMeta}>
                        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[consultant.category] || '#666' }]}>
                          <Text style={styles.categoryBadgeText}>
                            {consultant.category.charAt(0).toUpperCase() + consultant.category.slice(1)}
                          </Text>
                        </View>
                        {consultant.experience && (
                          <Text style={styles.resultExp}>{consultant.experience}</Text>
                        )}
                        {!consultant.is_approved && (
                          <Text style={styles.pendingBadge}>Pending</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* No results */}
            {!isSearching && (searchQuery || selectedCategory) && results.length === 0 && (
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <Search size={48} color="#D1D5DB" />
                <Text style={{ marginTop: 16, color: '#9CA3AF', fontSize: 15, fontFamily: fontBody }}>
                  No consultants found
                </Text>
              </View>
            )}

          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: '#ededed' },
  safeArea: { flex: 1 },
  mainScroll: { flex: 1 },
  
  header: {
    backgroundColor: colors.cardBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderCard,
  },
  backButton: { paddingRight: 12 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: fontSizes.base,
    fontFamily: fontMedium,
    color: colors.textPrimary,
  },
  filterButton: { paddingLeft: 16 },

  // Category pills
  categoryBar: {
    backgroundColor: colors.cardBg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderCard,
    maxHeight: 52,
  },
  categoryPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: fontSizes.base - 1,
    fontFamily: fontMedium,
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: colors.textOnPrimary,
  },

  container: { padding: spacing.xl },
  recentSection: { marginTop: spacing.md },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    fontFamily: fontHeavy,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tagPill: {
    backgroundColor: colors.overlayLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  tagText: {
    fontSize: fontSizes.base - 1,
    color: colors.textSecondary,
    fontFamily: fontMedium,
  },
  resultsSection: { marginTop: spacing.md, gap: spacing.md },

  // Result cards
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    gap: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.borderCard,
    ...shadows.sm,
  },
  resultAvatar: {
    width: 60,
    height: 60,
    borderRadius: radii.sm,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  resultAvatarImg: {
    width: 60,
    height: 60,
    borderRadius: radii.sm,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  resultName: {
    fontSize: fontSizes.lg,
    fontFamily: fontHeavy,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resultSub: {
    fontSize: fontSizes.sm,
    fontFamily: fontBody,
    color: colors.textSecondary,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  categoryBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fontMedium,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  resultExp: {
    fontSize: fontSizes.xs + 1,
    fontFamily: fontBody,
    color: colors.textTertiary,
  },
  pendingBadge: {
    fontSize: fontSizes.xs,
    fontFamily: fontMedium,
    color: colors.warning,
    fontWeight: '600',
  },
});
