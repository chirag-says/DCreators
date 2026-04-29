import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, Send } from 'lucide-react-native';

export default function RatingReviewScreen({ navigation }: any) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#FFF' }]} edges={['top']}>
      <ImageBackground source={require('../../assets/bg-texture.png')} style={styles.bg} imageStyle={{ opacity: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={28} color="#111" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Rate & Review</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
          <View style={styles.container}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Assignment Completed!</Text>
              <Text style={styles.summarySub}>Assignment No: 1021/D101/05/26</Text>
            </View>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>How was your experience?</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setRating(s)}>
                    <Star size={40} color="#EAB308" fill={s <= rating ? '#EAB308' : 'transparent'} strokeWidth={1.5} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Write a review (optional)</Text>
              <TextInput style={styles.reviewInput} placeholder="Share your experience..." placeholderTextColor="#9CA3AF" value={review} onChangeText={setReview} multiline textAlignVertical="top" />
            </View>
            <View style={{ gap: 12 }}>
              <Text style={styles.label}>Quick feedback</Text>
              <View style={styles.tagsWrap}>
                {['Professional','On Time','Creative','Responsive','Great Value','Would Rehire'].map((t) => (
                  <TouchableOpacity key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.actionsBar}>
          <TouchableOpacity style={[styles.submitBtn, rating === 0 && { backgroundColor: '#9CA3AF' }]} disabled={rating === 0} onPress={() => navigation.goBack()}>
            <Send size={18} color="#FFF" /><Text style={styles.submitText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
const f = Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium';
const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#ededed' }, safe: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 16, gap: 24 },
  header: {
    backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111', fontFamily: f },
  summaryCard: { backgroundColor: '#111', padding: 20, borderRadius: 12, alignItems: 'center' },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#FACC15', fontFamily: f, marginBottom: 6 },
  summarySub: { fontSize: 12, color: '#D1D5DB', fontFamily: f },
  ratingSection: { alignItems: 'center', gap: 12 },
  ratingLabel: { fontSize: 16, fontWeight: '700', color: '#111', fontFamily: f },
  starsRow: { flexDirection: 'row', gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', fontFamily: f },
  reviewInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 16, height: 120, fontSize: 14, fontFamily: f, color: '#111' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  tagText: { fontSize: 12, color: '#4B5563', fontFamily: f },
  actionsBar: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  submitBtn: { backgroundColor: '#00A346', paddingVertical: 14, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  submitText: { color: '#FFF', fontSize: 14, fontWeight: '700', fontFamily: f },
});
