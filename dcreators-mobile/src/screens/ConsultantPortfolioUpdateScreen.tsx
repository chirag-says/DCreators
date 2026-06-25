/**
 * ConsultantPortfolioUpdateScreen  (Phase 6.3)
 * Figma: CONSULTANT_PORTFOLIO_UPDATE_SCREEN.png
 * "Update Creative Portfolio"
 * — Max 5 portfolio artworks
 * — Upload slot (pick from gallery or camera)
 * — Per-artwork form: title, size, medium, price, available-for-sale toggle, brief
 * — Save / Edit buttons
 * — Submit Portfolio Update CTA
 * — Current Portfolio grid (3 columns) + slots remaining indicator
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, Switch, ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Upload, X, Save, Edit3, Send } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing } from '../styles/theme';

const NAVY   = '#1B3A5C';
const ORANGE = '#E87B35';
const TEAL   = '#3D9B8F';
const BG     = '#F7F8FA';
const MAX_SLOTS = 5;

interface ArtworkSlot {
  id?: string;
  localUri?: string;
  cloudUrl?: string;
  title: string;
  size: string;
  medium: string;
  price: string;
  availableForSale: boolean;
  brief: string;
  uploaded: boolean;
  submitting: boolean;
}

function emptySlot(): ArtworkSlot {
  return { title: '', size: '', medium: '', price: '', availableForSale: true, brief: '', uploaded: false, submitting: false };
}

export default function ConsultantPortfolioUpdateScreen({ navigation }: any) {
  const consultantProfile = useAuthStore(s => s.consultantProfile);
  const profile           = useAuthStore(s => s.profile);

  const [slots,   setSlots]   = useState<ArtworkSlot[]>([emptySlot()]);
  const [existing,setExisting]= useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode,    setMode]    = useState<'edit' | 'view'>('edit');

  const activeSlotIdx = slots.length - 1;

  useEffect(() => { fetchExisting(); }, []);

  async function fetchExisting() {
    if (!consultantProfile?.user_id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from('shop_products')
        .select('*')
        .eq('consultant_id', consultantProfile.user_id)
        .order('created_at', { ascending: false })
        .limit(MAX_SLOTS);
      setExisting(data ?? []);
    } catch {}
    finally { setLoading(false); }
  }

  function updateSlot(idx: number, patch: Partial<ArtworkSlot>) {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  }

  async function pickImage(idx: number) {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', 'Please allow media library access.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      updateSlot(idx, { localUri: result.assets[0].uri, uploaded: false });
    }
  }

  async function handleSave(idx: number) {
    const slot = slots[idx];
    if (!slot.title.trim()) { Alert.alert('Required', 'Please enter an artwork title.'); return; }
    if (!consultantProfile?.user_id) return;

    updateSlot(idx, { submitting: true });
    try {
      let cloudUrl = slot.cloudUrl;
      if (slot.localUri && !slot.uploaded) {
        cloudUrl = await uploadToCloudinary(slot.localUri, 'portfolio');
        updateSlot(idx, { cloudUrl, uploaded: true });
      }

      const payload = {
        consultant_id:  consultantProfile.user_id,
        title:          slot.title.trim(),
        size:           slot.size.trim() || null,
        medium:         slot.medium.trim() || null,
        price:          parseFloat(slot.price.replace(/,/g, '')) || 0,
        available:      slot.availableForSale,
        brief:          slot.brief.trim() || null,
        images:         cloudUrl ? [cloudUrl] : [],
        updated_at:     new Date().toISOString(),
      };

      if (slot.id) {
        await supabase.from('shop_products').update(payload).eq('id', slot.id);
      } else {
        const { data } = await supabase.from('shop_products').insert({ ...payload, created_at: new Date().toISOString() }).select().single();
        if (data) updateSlot(idx, { id: data.id });
      }

      Alert.alert('Saved ✅', 'Artwork saved to portfolio.');
      fetchExisting();
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { updateSlot(idx, { submitting: false }); }
  }

  async function handleSubmitAll() {
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].title.trim()) await handleSave(i);
    }
    Alert.alert('Portfolio Updated ✅', 'Your portfolio has been submitted for review.');
    navigation.goBack();
  }

  function addSlot() {
    if (slots.length + existing.length >= MAX_SLOTS) {
      Alert.alert('Limit reached', `Maximum ${MAX_SLOTS} portfolio items allowed.`);
      return;
    }
    setSlots(prev => [...prev, emptySlot()]);
  }

  const slotsRemaining = MAX_SLOTS - existing.length - slots.length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={18} color={NAVY} />
        </TouchableOpacity>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Notifications')} activeOpacity={0.7}>
            <Bell size={18} color={NAVY} />
          </TouchableOpacity>
          {profile?.avatar_url
            ? <Image source={{ uri: profile.avatar_url }} style={s.avatar} />
            : <View style={[s.avatar, s.avatarFallback]}>
                <Text style={s.avatarInit}>{(profile?.name ?? 'A').charAt(0).toUpperCase()}</Text>
              </View>
          }
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.heroTitle}>Update{'\n'}Creative{'\n'}Portfolio</Text>
        <Text style={s.heroSub}>
          Upload your original five Artworks/ Craftworks/ Photographs to showcase your unique style and attract high-tier clients.
        </Text>
        <Text style={s.maxHint}>Max file size: 2MB per upload.</Text>

        {/* ── New slot form(s) ── */}
        {slots.map((slot, idx) => (
          <View key={idx} style={s.slotCard}>
            {/* Slot header */}
            <TouchableOpacity style={s.slotHeader} onPress={addSlot} activeOpacity={0.85}>
              <Text style={s.slotHeaderText}>
                Add New Artwork {existing.length + idx + 1}/{MAX_SLOTS}
              </Text>
            </TouchableOpacity>

            {/* Upload zone */}
            <TouchableOpacity style={s.uploadZone} onPress={() => pickImage(idx)} activeOpacity={0.85}>
              {slot.localUri ? (
                <Image source={{ uri: slot.localUri }} style={s.uploadPreview} />
              ) : (
                <>
                  <Upload size={32} color={TEAL} />
                  <Text style={s.uploadLabel}>Upload Artwork</Text>
                  <Text style={s.uploadHint}>Drag & drop or click to browse</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Form fields */}
            <Text style={s.fieldLabel}>ARTWORK TITLE</Text>
            <TextInput style={s.input} placeholder="e.g. Ethereal Drift" placeholderTextColor={colors.textTertiary} value={slot.title} onChangeText={v => updateSlot(idx, { title: v })} editable={mode === 'edit'} />

            <Text style={s.fieldLabel}>SIZE</Text>
            <TextInput style={s.input} placeholder="e.g. 24 × 36 inches" placeholderTextColor={colors.textTertiary} value={slot.size} onChangeText={v => updateSlot(idx, { size: v })} editable={mode === 'edit'} />

            <Text style={s.fieldLabel}>MEDIUM</Text>
            <TextInput style={s.input} placeholder="e.g. Oil on Canvas" placeholderTextColor={colors.textTertiary} value={slot.medium} onChangeText={v => updateSlot(idx, { medium: v })} editable={mode === 'edit'} />

            <Text style={s.fieldLabel}>PRICE</Text>
            <TextInput style={s.input} placeholder="₹ 1,200.00" placeholderTextColor={colors.textTertiary} value={slot.price} onChangeText={v => updateSlot(idx, { price: v })} keyboardType="decimal-pad" editable={mode === 'edit'} />

            {/* Available for sale toggle */}
            <View style={s.toggleRow}>
              <Text style={s.toggleLabel}>Available for sale</Text>
              <Switch
                value={slot.availableForSale}
                onValueChange={v => updateSlot(idx, { availableForSale: v })}
                thumbColor="#fff"
                trackColor={{ true: TEAL, false: '#CBD5E1' }}
                disabled={mode !== 'edit'}
              />
            </View>

            <TextInput
              style={s.textarea}
              placeholder="Artwork brief:-"
              placeholderTextColor={colors.textTertiary}
              value={slot.brief}
              onChangeText={v => updateSlot(idx, { brief: v })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={mode === 'edit'}
            />

            {/* Save / Edit */}
            <View style={s.slotBtnRow}>
              <TouchableOpacity
                style={[s.saveBtn, slot.submitting && { opacity: 0.6 }]}
                onPress={() => handleSave(idx)}
                disabled={slot.submitting}
                activeOpacity={0.85}
              >
                {slot.submitting ? <ActivityIndicator color="#fff" size="small" /> : <><Save size={14} color="#fff" /><Text style={s.saveBtnText}>Save</Text></>}
              </TouchableOpacity>
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => setMode(m => m === 'edit' ? 'view' : 'edit')}
                activeOpacity={0.85}
              >
                <Edit3 size={14} color={NAVY} />
                <Text style={s.editBtnText}>{mode === 'edit' ? 'Lock' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ── Submit All ── */}
        <TouchableOpacity style={s.submitBtn} onPress={handleSubmitAll} activeOpacity={0.85}>
          <Send size={16} color="#fff" />
          <Text style={s.submitBtnText}>Submit Portfolio Update</Text>
        </TouchableOpacity>

        {/* ── Current Portfolio ── */}
        <Text style={s.currentLabel}>Current Portfolio ({existing.length}/{MAX_SLOTS})</Text>
        {loading ? (
          <ActivityIndicator size="small" color={TEAL} />
        ) : (
          <>
            <View style={s.portfolioGrid}>
              {existing.map(art => (
                <TouchableOpacity key={art.id} style={s.portfolioCell} activeOpacity={0.85}>
                  {art.images?.[0]
                    ? <Image source={{ uri: art.images[0] }} style={s.portfolioImg} />
                    : <View style={[s.portfolioImg, s.portfolioImgPlaceholder]}>
                        <Text style={s.portfolioImgText}>{art.title?.charAt(0) ?? 'A'}</Text>
                      </View>
                  }
                  <Text style={s.portfolioItemTitle} numberOfLines={1}>{art.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {slotsRemaining > 0 && (
              <View style={s.slotsRemaining}>
                <Text style={s.slotsRemainingText}>{slotsRemaining} SLOT{slotsRemaining !== 1 ? 'S' : ''} REMAINING</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  avatarInit: { color: '#fff', fontSize: 14, fontWeight: '800', fontFamily: fonts.heavy },
  scroll: { paddingHorizontal: 20, paddingBottom: 50 },
  heroTitle: { fontSize: 36, fontWeight: '900', fontFamily: fonts.heavy, color: NAVY, lineHeight: 42, marginTop: 10, marginBottom: 10 },
  heroSub: { fontSize: fontSizes.sm + 1, fontFamily: fonts.body, color: colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  maxHint: { fontSize: fontSizes.sm, fontWeight: '700', fontFamily: fonts.heavy, color: ORANGE, marginBottom: 20 },
  // Slot card
  slotCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20, overflow: 'hidden' },
  slotHeader: { backgroundColor: NAVY, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, margin: 12 },
  slotHeaderText: { color: '#fff', fontSize: fontSizes.lg, fontWeight: '800', fontFamily: fonts.heavy, textAlign: 'center' },
  uploadZone: { margin: 12, borderWidth: 2, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 32, alignItems: 'center', gap: 8, backgroundColor: '#FAFBFF' },
  uploadPreview: { width: '100%', height: 160, borderRadius: 10 },
  uploadLabel: { fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy, color: NAVY, marginTop: 8 },
  uploadHint: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.textTertiary },
  fieldLabel: { fontSize: 10, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textTertiary, letterSpacing: 0.8, marginBottom: 6, marginTop: 12, paddingHorizontal: 12 },
  input: { backgroundColor: '#F8F9FB', borderRadius: 10, borderWidth: 1, borderColor: colors.borderInput, paddingHorizontal: 14, paddingVertical: 12, fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.textPrimary, marginHorizontal: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  toggleLabel: { fontSize: fontSizes.base, fontFamily: fonts.heavy, color: TEAL, fontWeight: '700' },
  textarea: { backgroundColor: '#F8F9FB', borderRadius: 10, borderWidth: 1, borderColor: colors.borderInput, paddingHorizontal: 14, paddingVertical: 12, fontSize: fontSizes.sm + 1, fontFamily: fonts.body, color: colors.textPrimary, minHeight: 80, marginHorizontal: 12, marginBottom: 12 },
  slotBtnRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingBottom: 14 },
  saveBtn: { flex: 1, backgroundColor: NAVY, borderRadius: 10, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#fff', fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy },
  editBtn: { flex: 1, borderRadius: 10, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: NAVY },
  editBtnText: { color: NAVY, fontSize: fontSizes.base, fontWeight: '700', fontFamily: fonts.heavy },
  // Submit
  submitBtn: { backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 22 },
  submitBtnText: { color: '#fff', fontSize: fontSizes.lg, fontWeight: '800', fontFamily: fonts.heavy },
  // Current portfolio
  currentLabel: { fontSize: fontSizes.xl, fontWeight: '800', fontFamily: fonts.heavy, color: NAVY, marginBottom: 14 },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  portfolioCell: { width: '30%' },
  portfolioImg: { width: '100%', aspectRatio: 1, borderRadius: 10 },
  portfolioImgPlaceholder: { backgroundColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  portfolioImgText: { fontSize: 24, fontWeight: '900', fontFamily: fonts.heavy, color: '#fff' },
  portfolioItemTitle: { fontSize: fontSizes.xs + 1, fontFamily: fonts.body, color: colors.textSecondary, marginTop: 4 },
  slotsRemaining: { borderWidth: 1.5, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 10, paddingVertical: 20, alignItems: 'center' },
  slotsRemainingText: { fontSize: fontSizes.sm, fontWeight: '700', fontFamily: fonts.heavy, color: colors.textTertiary, letterSpacing: 0.6 },
});
