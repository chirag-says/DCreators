import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Home, Search, Clock, CheckCircle, ShoppingCart, MessageSquare, FileText, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { colors, fonts, fontSizes, spacing, radii } from '../styles/theme';

const IOS_BOTTOM_PADDING = Platform.OS === 'ios' ? 28 : 0;

export default function BottomNavigation({ state, navigation: tabNavigation }: any) {
  const stackNavigation = useNavigation<any>();
  const navigation = tabNavigation || stackNavigation;
  const currentRole = useAuthStore((s) => s.currentRole);
  const consultantProfile = useAuthStore((s) => s.consultantProfile);
  const profile = useAuthStore((s) => s.profile);

  const currentRouteName = state ? state.routes[state.index].name : '';

  // Detect if we're on a CreatorProfile screen and extract the creator data
  const isOnCreatorProfile = currentRouteName === 'CreatorProfile';
  const activeCreator = isOnCreatorProfile && state
    ? state.routes[state.index]?.params?.creator || null
    : null;

  // Hide the ActionBanner on screens where it's contextually redundant
  const HIDE_BANNER_SCREENS = [
    'AssignProject', 'FinalizeOffer', 'Payment', 'Terms', 'Chat',
    'ClientReview', 'ClientWorkorder', 'CreatorWorkorder', 'Invoice',
    'AssignMultiple', 'EditProfile', 'EditConsultantProfile',
    'CreatorOnboardingStep1', 'CreatorOnboardingStep2', 'CreatorOnboardingStep3',
    'ClientOnboarding', 'Settings', 'Notifications',
  ];
  const showBanner = !HIDE_BANNER_SCREENS.includes(currentRouteName);

  // Client tabs
  const clientTabs = [
    { name: 'Dashboard', label: 'Home', icon: Home },
    { name: 'Search', label: 'Search', icon: Search },
    { name: 'History', label: 'History', icon: Clock },
  ];

  // Consultant tabs
  const consultantTabs = [
    { name: 'Dashboard', label: 'Home', icon: Home },
    { name: 'FloatingQuery', label: 'Queries', icon: MessageSquare },
    { name: 'CreatorWorkorder', label: 'Orders', icon: FileText },
  ];

  const tabs = currentRole === 'consultant' ? consultantTabs : clientTabs;

  return (
    <View style={styles.wrapper}>
      {/* Action Banner — hidden on task-specific screens */}
      {showBanner && (
      <View style={styles.actionBanner}>
        {isOnCreatorProfile ? (
          /* ── CreatorProfile: same layout, personalized for THIS creator ── */
          <>
            <TouchableOpacity 
              style={styles.leftAction}
              onPress={() => navigation.navigate('AssignProject', { creator: activeCreator })}
            >
              <CheckCircle size={28} color={colors.primary} strokeWidth={2.5} />
              <View style={styles.textStack}>
                <Text style={styles.mainText}>Assign Project to {activeCreator?.name || 'Creator'} /</Text>
                <Text style={styles.subText}>Hire {activeCreator?.name || 'Creative Consultant'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.rightAction}
              onPress={() => navigation.navigate('Shop', { creatorId: activeCreator?.id, creator: activeCreator })}
            >
              <ShoppingCart size={24} color={colors.primaryDark} />
              <Text style={styles.shopText}>Add to Cart</Text>
            </TouchableOpacity>
          </>
        ) : currentRole === 'consultant' ? (
          <>
            <TouchableOpacity 
              style={styles.leftAction}
              onPress={() => navigation.navigate('CreatorProfile', { creator: {
                id: consultantProfile?.id,
                name: consultantProfile?.display_name || profile?.name || 'Creator',
                code: consultantProfile?.code || 'D---',
                subtitle: consultantProfile?.subtitle || '',
                experience: consultantProfile?.experience || '',
                expertise: consultantProfile?.expertise || '',
                category: consultantProfile?.category || 'photographer',
                base_price: consultantProfile?.base_price,
                user_id: consultantProfile?.user_id,
                avatar_url: consultantProfile?.avatar_url || null,
                portfolio_images: consultantProfile?.portfolio_images || [],
              }})}
            >
              <User size={28} color={colors.success} strokeWidth={2.5} />
              <View style={styles.textStack}>
                <Text style={styles.mainText}>My Profile /</Text>
                <Text style={styles.subText}>Portfolio & Settings</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.leftAction}
            onPress={() => navigation.navigate('AssignProject')}
          >
            <CheckCircle size={28} color="#EF4444" strokeWidth={2.5} />
            <View style={styles.textStack}>
              <Text style={styles.mainText}>Assign Project /</Text>
              <Text style={styles.subText}>Hire Creative Consultant</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Shop icon — only on non-profile screens */}
        {!isOnCreatorProfile && (
          <TouchableOpacity 
            style={styles.rightAction}
            onPress={() => navigation.navigate('Shop')}
          >
            <ShoppingCart size={24} color={colors.primaryDark} />
            <Text style={styles.shopText}>Shop</Text>
          </TouchableOpacity>
        )}
      </View>
      )}

      {/* Bottom Navigation Tabs */}
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = currentRouteName === tab.name;
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity 
              key={tab.name}
              style={styles.navItem} 
              onPress={() => navigation.navigate(tab.name)}
            >
              <IconComponent size={24} color={isActive ? '#EAB308' : '#9CA3AF'} strokeWidth={2} />
              <Text style={[styles.navText, { color: isActive ? '#EAB308' : '#9CA3AF' }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  // Action Banner
  actionBanner: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderCard,
  },
  leftAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textStack: {
    flexDirection: 'column',
  },
  mainText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.heavy,
  },
  subText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: -2,
    fontFamily: fonts.medium,
  },
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  shopText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.heavy,
  },

  // Navigation Bar
  navBar: {
    width: '100%',
    backgroundColor: '#111111',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10 + IOS_BOTTOM_PADDING,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
