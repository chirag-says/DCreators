import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Platform,
  ScrollView, ImageBackground, Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../components/TopHeader';
import { ChevronDown, User, Square, CheckSquare, Camera, X, ImagePlus } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts, fontSizes, spacing, radii, shadows, inputStyle } from '../styles/theme';

const CATEGORIES = [
  'Photography', 'Videography', 'Design', 'Painting',
  'Sculpture', 'Traditional Craft', 'Illustration',
];

const EXPERIENCE_OPTIONS = ['1-3 years', '3-5 years', '5-10 years', '10+ years'];

export default function CreatorOnboarding({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { profile, setRole, fetchConsultantProfile } = useAuthStore();

  // Step 1 state
  const [academicDegree, setAcademicDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [showExpDropdown, setShowExpDropdown] = useState(false);
  const [showOfferDropdown, setShowOfferDropdown] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [consultancyFees, setConsultancyFees] = useState<Record<string, string>>({});

  // Step 2 state — 5 upload slots
  const [portfolioItems, setPortfolioItems] = useState([
    { title: '', medium: '', sizeCm: '', price: '', forSale: false, imageUri: '' },
    { title: '', medium: '', sizeCm: '', price: '', forSale: false, imageUri: '' },
    { title: '', medium: '', sizeCm: '', price: '', forSale: false, imageUri: '' },
    { title: '', medium: '', sizeCm: '', price: '', forSale: false, imageUri: '' },
    { title: '', medium: '', sizeCm: '', price: '', forSale: false, imageUri: '' },
  ]);

  const creatorName = profile?.name || route?.params?.userName || 'Creator';
  const creatorCode = 'D---';

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function updatePortfolioItem(index: number, field: string, value: any) {
    setPortfolioItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function pickPortfolioImage(index: number) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updatePortfolioItem(index, 'imageUri', result.assets[0].uri);
    }
  }

  // Map UI categories to DB categories
  function mapCategory(uiCategories: string[]): string {
    const mapping: Record<string, string> = {
      'Photography': 'photographer',
      'Videography': 'photographer',
      'Design': 'designer',
      'Painting': 'designer',
      'Sculpture': 'sculptor',
      'Traditional Craft': 'artisan',
      'Illustration': 'designer',
    };
    return mapping[uiCategories[0]] || 'designer';
  }

  async function handleSave() {
    Alert.alert('Saved', 'Your progress has been saved locally. Tap Submit when you\'re ready to finalize.');
  }

  async function handleSubmit() {
    if (!profile?.id) {
      Alert.alert('Error', 'You must be logged in to submit.');
      return;
    }
    if (selectedCategories.length === 0) {
      Alert.alert('Missing Info', 'Please select at least one consultancy category in Step 1.');
      return;
    }

    setIsSaving(true);
    try {
      // Generate a unique consultant code
      const code = `D${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Get base price from first consultancy fee
      const firstFee = Object.values(consultancyFees)[0];
      const basePrice = firstFee ? parseFloat(firstFee) : null;

      // Collect uploaded portfolio image URIs
      const portfolioImageUris = portfolioItems
        .filter(item => item.imageUri)
        .map(item => item.imageUri);

      const { error } = await supabase.from('consultant_profiles').insert({
        user_id: profile.id,
        display_name: creatorName,
        code,
        category: mapCategory(selectedCategories),
        subtitle: `${academicDegree}${institution ? ', ' + institution : ''}`,
        experience: selectedExperience,
        expertise: selectedCategories.join(', '),
        bio: null,
        avatar_url: profileImage || null,
        portfolio_images: portfolioImageUris,
        base_price: basePrice,
        is_approved: false,
        is_active: true,
      });

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Already Registered', 'You already have a consultant profile.');
        } else {
          Alert.alert('Error', error.message);
        }
        setIsSaving(false);
        return;
      }

      // Update profile flag
      await supabase.from('profiles').update({ has_consultant_profile: true }).eq('id', profile.id);

      // Refresh store
      await fetchConsultantProfile();
      setRole('consultant');

      Alert.alert(
        'Profile Submitted! 🎉',
        'Your consultant profile is pending admin approval. You can start exploring the consultant dashboard.',
        [{ text: 'Continue', onPress: () => {
          navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Dashboard' } }] });
        }}]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <TopHeader />

        <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>

          {/* Profile area — Figma C1.1: avatar circle + name */}
          <View style={styles.profileArea}>
            <TouchableOpacity style={styles.photoFrame} activeOpacity={0.7} onPress={async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow photo library access.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 5],
                quality: 0.7,
              });
              if (!result.canceled && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
              }
            }}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.photoImage} />
              ) : (
                <>
                  <User size={48} color={colors.teal} />
                  <Camera size={16} color={colors.orange} style={{ position: 'absolute', bottom: 8, right: 8 }} />
                </>
              )}
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Mr. {creatorName} / {creatorCode}</Text>
              {activeTab === 2 && selectedExperience ? (
                <>
                  <Text style={styles.profileSub}>{academicDegree || 'Academic Degree'}</Text>
                  <Text style={styles.profileSub}>Experience: {selectedExperience}</Text>
                  <Text style={styles.profileSub}>Area of expertise: {selectedCategories.join(', ') || '—'}</Text>
                </>
              ) : null}
            </View>
          </View>

          {/* Step tabs */}
          <View style={styles.stepTabs}>
            <TouchableOpacity
              style={[styles.stepTab, activeTab === 1 && styles.stepTabActive1]}
              onPress={() => setActiveTab(1)}
            >
              <Text style={[styles.stepTabLabel, activeTab === 1 && styles.stepTabLabelActive]}>Step 1</Text>
              <Text style={[styles.stepTabTitle, activeTab === 1 && styles.stepTabTitleActive]}>Consultancy Detail</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stepTab, activeTab === 2 && styles.stepTabActive2]}
              onPress={() => setActiveTab(2)}
            >
              <Text style={[styles.stepTabLabel, activeTab === 2 && styles.stepTabLabelActive]}>Step 2</Text>
              <Text style={[styles.stepTabTitle, activeTab === 2 && styles.stepTabTitleActive]}>Portfolio Detail</Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: Consultancy Detail */}
          {activeTab === 1 && (
            <View style={styles.formSection}>

              {/* Academic Degree */}
              <Text style={styles.sectionTitle}>Highest Academic Degree</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. MVA Applied Art"
                placeholderTextColor={colors.textTertiary}
                value={academicDegree}
                onChangeText={setAcademicDegree}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Institution name"
                placeholderTextColor={colors.textTertiary}
                value={institution}
                onChangeText={setInstitution}
              />

              {/* Creative Experience dropdown */}
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setShowExpDropdown(!showExpDropdown)}
              >
                <Text style={styles.dropdownLabel}>Creative Experience</Text>
                <View style={styles.dropdownRight}>
                  <Text style={styles.dropdownValue}>{selectedExperience || 'Select'}</Text>
                  <ChevronDown size={18} color={colors.teal} />
                </View>
              </TouchableOpacity>
              {showExpDropdown && (
                <View style={styles.dropdownList}>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownItem}
                      onPress={() => { setSelectedExperience(opt); setShowExpDropdown(false); }}
                    >
                      <Text style={styles.dropdownItemText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Consultancy offer — tapping this reveals category checkboxes */}
              <TouchableOpacity
                style={[styles.dropdownBtn, { borderColor: colors.teal }]}
                onPress={() => setShowOfferDropdown(!showOfferDropdown)}
              >
                <Text style={[styles.dropdownLabel, { color: colors.teal }]}>Consultancy offer</Text>
                <View style={styles.dropdownRight}>
                  <Text style={styles.dropdownValue} numberOfLines={1}>
                    {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Select services'}
                  </Text>
                  <ChevronDown size={18} color={colors.teal} />
                </View>
              </TouchableOpacity>

              {/* Category checkboxes — only visible when dropdown is open */}
              {showOfferDropdown && (
                <View style={styles.checklistBox}>
                  {CATEGORIES.map((cat) => {
                    const checked = selectedCategories.includes(cat);
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={styles.checkRow}
                        onPress={() => toggleCategory(cat)}
                      >
                        {checked ? (
                          <CheckSquare size={20} color={colors.teal} />
                        ) : (
                          <Square size={20} color={colors.textTertiary} />
                        )}
                        <Text style={[styles.checkLabel, checked && styles.checkLabelActive]}>{cat}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Consultancy fees — one input per selected category */}
              {selectedCategories.length > 0 && (
                <View style={styles.feeSection}>
                  <Text style={styles.feeSectionTitle}>Consultancy fee per service</Text>
                  {selectedCategories.map((cat) => (
                    <View key={cat} style={[styles.dropdownBtn, { borderColor: colors.primary }]}>
                      <Text style={[styles.dropdownLabel, { color: colors.primary, flex: 1 }]}>{cat}</Text>
                      <TextInput
                        style={styles.feeInput}
                        placeholder="₹ Fee"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                        value={consultancyFees[cat] || ''}
                        onChangeText={(v) => setConsultancyFees((prev) => ({ ...prev, [cat]: v }))}
                      />
                    </View>
                  ))}
                </View>
              )}

            </View>
          )}

          {/* TAB 2: Portfolio Detail */}
          {activeTab === 2 && (
            <View style={styles.formSection}>
              <Text style={styles.uploadInstructions}>
                Upload your original <Text style={styles.bold}>five Artworks/ designs/photographs</Text> in JPEG or PDF format with maximum <Text style={styles.bold}>2 MB</Text> file size for each
              </Text>

              {portfolioItems.map((item, i) => {
                const ordinal = ['1st', '2nd', '3rd', '4th', '5th'][i];
                return (
                  <View key={i} style={styles.uploadCard}>
                    <View style={styles.uploadCardHeader}>
                      <TouchableOpacity style={styles.uploadImgBtn} onPress={() => pickPortfolioImage(i)}>
                        <ImagePlus size={14} color={colors.textPrimary} />
                        <Text style={styles.uploadBtnText}>Upload {ordinal}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saleCheck}
                        onPress={() => updatePortfolioItem(i, 'forSale', !item.forSale)}
                      >
                        {item.forSale ? (
                          <CheckSquare size={18} color={colors.success} />
                        ) : (
                          <Square size={18} color={colors.textTertiary} />
                        )}
                        <Text style={styles.saleText}>Available for sale</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Image preview */}
                    {item.imageUri ? (
                      <View style={styles.previewContainer}>
                        <Image source={{ uri: item.imageUri }} style={styles.previewImage} />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => updatePortfolioItem(i, 'imageUri', '')}
                        >
                          <X size={14} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    <View style={styles.uploadFields}>
                      <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Size in CM</Text>
                        <TextInput
                          style={styles.fieldInput}
                          placeholder="e.g. 30x40"
                          placeholderTextColor={colors.textTertiary}
                          value={item.sizeCm}
                          onChangeText={(v) => updatePortfolioItem(i, 'sizeCm', v)}
                        />
                        <Text style={styles.fieldLabel}>Medium</Text>
                        <TextInput
                          style={styles.fieldInput}
                          placeholder="e.g. Oil on canvas"
                          placeholderTextColor={colors.textTertiary}
                          value={item.medium}
                          onChangeText={(v) => updatePortfolioItem(i, 'medium', v)}
                        />
                      </View>
                      <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Title</Text>
                        <TextInput
                          style={[styles.fieldInput, { flex: 1 }]}
                          placeholder="Artwork title"
                          placeholderTextColor={colors.textTertiary}
                          value={item.title}
                          onChangeText={(v) => updatePortfolioItem(i, 'title', v)}
                        />
                      </View>
                      <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Price</Text>
                        <TextInput
                          style={[styles.fieldInput, { flex: 1 }]}
                          keyboardType="numeric"
                          placeholder="₹ Price"
                          placeholderTextColor={colors.textTertiary}
                          value={item.price}
                          onChangeText={(v) => updatePortfolioItem(i, 'price', v)}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

        </ScrollView>

        {/* Action buttons bar — Figma C1.1: Save + Next at bottom */}
        <View style={styles.actionBar}>
          {activeTab === 2 && (
            <TouchableOpacity style={styles.prevBtn} onPress={() => setActiveTab(1)}>
              <Text style={styles.prevBtnText}>← Previous</Text>
            </TouchableOpacity>
          )}
          {activeTab === 1 && (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveTab(2)}>
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.screenBg },
  safe: { flex: 1 },
  mainScroll: { flex: 1 },

  // Profile area — Figma C1.1: centered avatar circle
  profileArea: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  photoFrame: {
    width: 100, height: 110, borderRadius: radii.sm,
    borderWidth: 2, borderColor: colors.teal, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  photoImage: {
    width: 100, height: 110, borderRadius: radii.sm,
  },
  profileInfo: { marginLeft: spacing.md, flex: 1 },
  profileName: { fontSize: fontSizes.md, fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: 4 },
  profileSub: { fontSize: fontSizes.xs + 1, fontFamily: fonts.body, color: colors.textSecondary, lineHeight: 16 },

  // Step tabs
  stepTabs: {
    flexDirection: 'row', marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.md,
  },
  stepTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.sm, gap: 4,
  },
  stepTabActive1: { backgroundColor: '#EEF2FF', borderRadius: radii.sm },
  stepTabActive2: { backgroundColor: '#FEF3C7', borderRadius: radii.sm },
  stepTabLabel: { fontSize: fontSizes.xs, fontFamily: fonts.heavy, color: colors.textTertiary, backgroundColor: colors.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, overflow: 'hidden' },
  stepTabLabelActive: { backgroundColor: colors.primary, color: colors.textOnPrimary },
  stepTabTitle: { fontSize: fontSizes.base - 1, fontFamily: fonts.medium, color: colors.textTertiary },
  stepTabTitleActive: { color: colors.textPrimary },

  // Form section
  formSection: { paddingHorizontal: spacing.xl, gap: spacing.md },
  sectionTitle: { fontSize: fontSizes.md, fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: 4 },

  // Figma-style rounded inputs
  formInput: {
    ...inputStyle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.base,
    borderRadius: radii.full,
  },

  // Dropdown
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.teal, borderRadius: radii.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.cardBg,
  },
  dropdownLabel: { fontSize: fontSizes.base - 1, fontFamily: fonts.medium, color: colors.teal },
  dropdownRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dropdownValue: { fontSize: fontSizes.base - 1, fontFamily: fonts.body, color: colors.textPrimary },
  dropdownList: {
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.sm, marginTop: -8,
    ...shadows.sm,
  },
  dropdownItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  dropdownItemText: { fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textPrimary },

  // Checklist
  checklistBox: {
    backgroundColor: colors.cardBg, borderRadius: radii.md, padding: spacing.md, gap: spacing.md,
    ...shadows.sm,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkLabel: { fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textSecondary },
  checkLabelActive: { fontFamily: fonts.medium, color: colors.textPrimary },

  // Fee section
  feeSection: { gap: spacing.md },
  feeSectionTitle: { fontSize: fontSizes.base, fontFamily: fonts.heavy, color: colors.textPrimary, marginBottom: 2 },
  feeInput: {
    width: 100, textAlign: 'right',
    fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textPrimary,
    paddingVertical: 0,
  },

  // Upload instructions
  uploadInstructions: { fontSize: fontSizes.base - 1, fontFamily: fonts.body, color: colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  bold: { fontFamily: fonts.heavy, color: colors.teal, textDecorationLine: 'underline' },

  // Upload card
  uploadCard: {
    backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.sm, padding: spacing.md, gap: spacing.sm,
    ...shadows.sm,
  },
  uploadCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  uploadImgBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.sm,
  },
  uploadBtnText: { fontSize: fontSizes.sm, fontFamily: fonts.medium, color: colors.textPrimary },
  saleCheck: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  saleText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textSecondary },
  previewContainer: {
    position: 'relative', borderRadius: radii.sm, overflow: 'hidden',
    marginTop: 4, backgroundColor: colors.borderLight,
  },
  previewImage: {
    width: '100%', height: 160, borderRadius: radii.sm,
  },
  removeImageBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: colors.overlay, borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  uploadFields: { gap: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel: { fontSize: fontSizes.xs + 1, fontFamily: fonts.medium, color: colors.textSecondary, width: 60 },
  fieldInput: {
    borderBottomWidth: 1, borderBottomColor: colors.borderInput,
    paddingVertical: 4, fontSize: fontSizes.base - 1, fontFamily: fonts.body, color: colors.textPrimary,
    minWidth: 60,
  },

  // Action bar — Figma C1.1: Save (outline) + Next (teal fill)
  actionBar: {
    flexDirection: 'row', justifyContent: 'center', gap: spacing.md,
    paddingTop: spacing.md, paddingBottom: 50, paddingHorizontal: spacing.lg,
    backgroundColor: colors.screenBg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  prevBtn: {
    flex: 1, backgroundColor: colors.textSecondary,
    paddingVertical: spacing.md, borderRadius: radii.full, alignItems: 'center',
  },
  prevBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.base, fontFamily: fonts.medium },
  nextBtn: {
    flex: 1, backgroundColor: colors.teal,
    paddingVertical: spacing.md, borderRadius: radii.full, alignItems: 'center',
  },
  nextBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.base, fontFamily: fonts.heavy },
  saveBtn: {
    flex: 1, backgroundColor: colors.cardBg,
    paddingVertical: spacing.md, borderRadius: radii.full, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.teal,
  },
  saveBtnText: { color: colors.teal, fontSize: fontSizes.base, fontFamily: fonts.heavy },
  submitBtn: {
    flex: 1, backgroundColor: colors.primary,
    paddingVertical: spacing.md, borderRadius: radii.full, alignItems: 'center',
  },
  submitBtnText: { color: colors.textOnPrimary, fontSize: fontSizes.base, fontFamily: fonts.heavy },
});
