import React from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, Bookmark, Trash2 } from 'lucide-react-native';
import CloudImage from '../components/CloudImage';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const LOCAL_IMAGES: Record<string, any> = {
  'dcreators/photographer': require('../../assets/photographer.png'),
  'dcreators/designer': require('../../assets/designer.png'),
  'dcreators/sculptor': require('../../assets/sculptor.png'),
};

const SAVED_CREATORS = [
  { id: '1', name: 'Shoumik Sen', code: 'D101', category: 'Photographer', rating: 4.8, projects: 32, avatar: 'dcreators/photographer' },
  { id: '2', name: 'Rajdeep Das', code: 'D207', category: 'Designer', rating: 4.6, projects: 24, avatar: 'dcreators/designer' },
  { id: '3', name: 'Amit Ghosh', code: 'D305', category: 'Sculptor', rating: 4.9, projects: 18, avatar: 'dcreators/sculptor' },
];

export default function SavedCreatorsScreen({ navigation }: any) {
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
          <Text style={styles.headerTitle}>Saved Creators</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {SAVED_CREATORS.map((creator) => (
              <TouchableOpacity 
                key={creator.id} 
                style={styles.creatorCard}
                onPress={() => navigation.navigate('CreatorProfile', { creator })}
              >
                <ImageBackground
                  source={LOCAL_IMAGES[creator.avatar]}
                  style={styles.avatarImage}
                  imageStyle={{ borderRadius: radii.lg }}
                  resizeMode="cover"
                />
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.creatorName}>{creator.name}</Text>
                    <TouchableOpacity>
                      <Bookmark size={20} color={colors.primary} fill={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.creatorCode}>{creator.code} · {creator.category}</Text>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.ratingBox}>
                      <Star size={14} color="#EAB308" fill="#EAB308" />
                      <Text style={styles.ratingText}>{creator.rating}</Text>
                    </View>
                    <Text style={styles.projectsText}>{creator.projects} projects</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.removeBtn}>
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: colors.screenBg },
  safeArea: { flex: 1 },
  mainScroll: { flex: 1 },
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  
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

  creatorCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.card,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  creatorName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy },
  creatorCode: { fontSize: fontSizes.sm, color: colors.textSecondary, fontFamily: fonts.medium, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ratingText: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy },
  projectsText: { fontSize: fontSizes.sm, color: colors.textTertiary, fontFamily: fonts.medium },
  
  removeBtn: {
    width: 32, height: 32, borderRadius: radii.xl,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
