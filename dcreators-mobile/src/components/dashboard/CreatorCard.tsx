// ============================================
// CreatorCard — Dashboard creator card
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Platform } from 'react-native';
import CloudImage from '../CloudImage';
import { fonts } from '../../styles/theme';
import { RemoteAssets } from '../../lib/assets';
import type { CreatorCardViewModel } from '../../types/navigation';

/** Cloudinary image map for default creator avatars */
const REMOTE_IMAGES: Record<string, string> = {
  'dcreators/photographer': RemoteAssets.photographer,
  'dcreators/designer': RemoteAssets.designer,
  'dcreators/sculptor': RemoteAssets.sculptor,
  'dcreators/artisan': RemoteAssets.artisan,
  'dcreators/photo_archive_1': RemoteAssets.photoArchive1,
  'dcreators/photo_archive_2': RemoteAssets.photoArchive2,
  'dcreators/photo_archive_3': RemoteAssets.photoArchive3,
  'dcreators/design_hub_1': RemoteAssets.designHub1,
  'dcreators/design_hub_2': RemoteAssets.designHub2,
  'dcreators/design_hub_3': RemoteAssets.designHub3,
};

export type CardStyle = 'card' | 'archive' | 'hub';

interface CreatorCardProps {
  creator: CreatorCardViewModel;
  cardStyle: CardStyle;
  labelBg: string;
  showCategoryChip: boolean;
  onPress: (creator: CreatorCardViewModel) => void;
}

export default function CreatorCard({ creator, cardStyle, labelBg, showCategoryChip, onPress }: CreatorCardProps) {
  const isMainCard = cardStyle === 'card';
  const cardSizeStyle = isMainCard ? styles.card : cardStyle === 'archive' ? styles.cardArchive : styles.cardHub;
  const borderR = isMainCard ? 10 : 8;
  const categoryLabel = creator.category.charAt(0).toUpperCase() + creator.category.slice(1);
  // Prioritize real uploaded avatar_url, then check preset map, then check if avatar_public_id is itself a URL
  const hasRealAvatar = creator.avatar_url && creator.avatar_url.startsWith('http');
  const remoteUrl = hasRealAvatar
    ? creator.avatar_url
    : REMOTE_IMAGES[creator.avatar_public_id] || (creator.avatar_public_id.startsWith('http') ? creator.avatar_public_id : undefined);

  const cardContent = (
    <>
      {showCategoryChip && (
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{categoryLabel}</Text>
        </View>
      )}
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
    <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(creator)} style={styles.cardShadow}>
      {remoteUrl ? (
        <ImageBackground
          source={{ uri: remoteUrl }}
          style={cardSizeStyle}
          imageStyle={{ borderRadius: borderR }}
          resizeMode="cover"
        >
          {cardContent}
        </ImageBackground>
      ) : (
        <View style={cardSizeStyle}>
          <CloudImage
            publicId={creator.avatar_public_id}
            width={isMainCard ? 155 : 145}
            height={isMainCard ? 175 : 145}
            borderRadius={borderR}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
          {cardContent}
        </View>
      )}
    </TouchableOpacity>
  );
}

const fontMedium = fonts.medium;

const styles = StyleSheet.create({
  card: {
    width: 155, height: 175, borderRadius: 10,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  cardArchive: {
    width: 145, height: 145, borderRadius: 8,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  cardHub: {
    width: 145, height: 145, borderRadius: 8,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  cardShadow: {
    borderRadius: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  categoryChip: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  categoryChipText: {
    color: '#FACC15', fontSize: 9, fontWeight: '700',
    fontFamily: fontMedium, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  labelPillContainer: { alignItems: 'center', marginBottom: 8, zIndex: 2 },
  labelPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  labelPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', fontFamily: fontMedium, letterSpacing: 0.3 },
});
