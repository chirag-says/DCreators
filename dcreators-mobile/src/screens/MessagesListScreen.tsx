import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Plus } from 'lucide-react-native';
import CloudImage from '../components/CloudImage';
import { colors, fonts, fontSizes, spacing, radii, shadows } from '../styles/theme';

const CHATS = [
  { id: '1', name: 'Shoumik Sen', code: 'D101', role: 'Photographer', lastMessage: 'Here are the final edited drafts for your review.', time: '10:42 AM', unread: 2, avatar: 'dcreators/photographer' },
  { id: '2', name: 'Rajdeep Das', code: 'D207', role: 'Designer', lastMessage: 'Yes, the logo source files are included in the ZIP.', time: 'Yesterday', unread: 0, avatar: 'dcreators/designer' },
  { id: '3', name: 'Amit Ghosh', code: 'D305', role: 'Sculptor', lastMessage: 'Let me check the material availability and get back.', time: 'Mon', unread: 0, avatar: 'dcreators/sculptor' },
  { id: '4', name: 'DCreators Support', code: 'Admin', role: 'Support Team', lastMessage: 'Your payment for Assignment 1021 has been processed.', time: 'May 4', unread: 0, avatar: null },
];

const LOCAL_IMAGES: Record<string, any> = {
  'dcreators/photographer': require('../../assets/photographer.png'),
  'dcreators/designer': require('../../assets/designer.png'),
  'dcreators/sculptor': require('../../assets/sculptor.png'),
};

export default function MessagesListScreen({ navigation }: any) {
  const renderItem = ({ item }: { item: typeof CHATS[0] }) => (
    <TouchableOpacity 
      style={styles.chatRow} 
      onPress={() => navigation.navigate('Chat')}
    >
      {item.avatar ? (
        <ImageBackground
          source={LOCAL_IMAGES[item.avatar]}
          style={styles.avatar}
          imageStyle={{ borderRadius: 25 }}
        />
      ) : (
        <View style={[styles.avatar, styles.supportAvatar]}>
          <Text style={styles.supportAvatarText}>D</Text>
        </View>
      )}

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, item.unread > 0 && styles.textBold]}>{item.name}</Text>
          <Text style={[styles.chatTime, item.unread > 0 && styles.textBold]}>{item.time}</Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text 
            style={[styles.lastMessage, item.unread > 0 && styles.textBold]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Search size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Plus size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={CHATS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />

      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: colors.screenBg },
  safeArea: { flex: 1 },
  
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
  headerTitle: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.textPrimary, fontFamily: fonts.heavy },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBtn: { padding: spacing.xs },

  listContainer: { paddingVertical: spacing.sm },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 80, marginRight: spacing.lg },

  chatRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  supportAvatar: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  supportAvatarText: { color: colors.textOnPrimary, fontSize: 22, fontWeight: 'bold', fontFamily: fonts.heavy },
  
  chatInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  chatName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textPrimary, fontFamily: fonts.medium },
  chatTime: { fontSize: fontSizes.sm, color: colors.textTertiary, fontFamily: fonts.medium },
  
  chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { flex: 1, fontSize: fontSizes.sm + 1, color: colors.textSecondary, fontFamily: fonts.body, paddingRight: spacing.lg },
  textBold: { fontWeight: '700', color: colors.textPrimary },
  
  unreadBadge: {
    backgroundColor: colors.primary,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  unreadText: { color: colors.textOnPrimary, fontSize: fontSizes.xs, fontWeight: 'bold' },
});
