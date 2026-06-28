/**
 * BottomNavigation — Figma exact replica
 * Screen 33: BottomNavBar.png
 *
 * Style: white background, navy active, gray inactive, rounded top border
 *
 * Tab visibility depends on role:
 *   - client:     HOME | SEARCH | HISTORY | PROFILE
 *   - consultant: HOME | SEARCH | PROFILE
 *
 * Note: consultant Home (Dashboard tab) already renders CreatorDashboardScreen,
 * which has its own Sales Dashboard / Project Dashboard toggle — so there is no
 * separate "SALES" tab here (it would just duplicate Home and drop the tab bar).
 *
 * No BACK tab — native iOS/Android swipe-back gesture (and the hardware/edge
 * swipe) handles backwards navigation; a dedicated button duplicated that.
 */
import React, { useEffect, useRef } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet, Platform, LayoutAnimation, UIManager,
} from 'react-native';
import {
  Home, Search, User, Clock,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { fonts, fontSizes } from '../styles/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Figma tokens
const NAVY   = '#1B3A5C';
const GRAY   = '#9CA3AF';
const WHITE  = '#FFFFFF';
const BORDER = '#E5E7EB';

interface TabDef {
  name: string;
  label: string;
  Icon: React.FC<{ size: number; color: string; strokeWidth?: number }>;
}

export default function BottomNavigation({ state, navigation: tabNavigation }: any) {
  const stackNavigation = useNavigation<any>();
  const navigation = tabNavigation || stackNavigation;
  const insets     = useSafeAreaInsets();
  const currentRole = useAuthStore((s) => s.currentRole);

  const currentRouteName = state ? state.routes[state.index].name : '';

  // ── Tab definitions per role ────────────────────────────────
  const clientTabs: TabDef[] = [
    { name: 'Dashboard', label: 'HOME',   Icon: Home },
    { name: 'Search',    label: 'SEARCH', Icon: Search },
    { name: 'History',   label: 'HISTORY',Icon: Clock },
    { name: 'EditProfile', label: 'PROFILE', Icon: User },
  ];

  const consultantTabs: TabDef[] = [
    { name: 'Dashboard', label: 'HOME',   Icon: Home },
    { name: 'Search',    label: 'SEARCH', Icon: Search },
    { name: 'EditConsultantProfile', label: 'PROFILE', Icon: User },
  ];

  const tabs = currentRole === 'consultant' ? consultantTabs : clientTabs;

  // Smooth out the tab-count reflow (4 consultant tabs vs 5 client tabs)
  // when the Client ↔ Creator switch is toggled, instead of an instant snap.
  const prevRole = useRef(currentRole);
  useEffect(() => {
    if (prevRole.current !== currentRole) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      prevRole.current = currentRole;
    }
  }, [currentRole]);

  function handlePress(tab: TabDef) {
    // Use tab navigator if available, else stack navigate
    if (tabNavigation) {
      try { tabNavigation.navigate(tab.name); } catch { stackNavigation.navigate(tab.name); }
    } else {
      stackNavigation.navigate(tab.name);
    }
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(8, insets.bottom) }]}>
      {/* Top border */}
      <View style={styles.topBorder} />

      {tabs.map((tab) => {
        const isActive = currentRouteName === tab.name;
        const iconColor = isActive ? NAVY : GRAY;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => handlePress(tab)}
            activeOpacity={0.7}
            accessibilityLabel={tab.label}
          >
            <tab.Icon
              size={22}
              color={iconColor}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[styles.tabLabel, { color: iconColor, fontWeight: isActive ? '800' : '600' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: BORDER,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  tabLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.heavy,
    letterSpacing: 0.3,
    marginTop: 2,
  },
});
