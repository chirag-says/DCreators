import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Search, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, shadows } from '../styles/theme';

/**
 * TopHeader — Figma B-series header pattern
 * Hamburger menu (3 indigo lines) + D icon on left
 * Search icon + User circle on right
 * Clean white background strip with subtle bottom border
 */
export default function TopHeader() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      {/* Left: Hamburger + D icon */}
      <View style={styles.leftGroup}>
        <TouchableOpacity style={styles.hamburger} onPress={() => navigation.navigate('Menu')}>
          <View style={styles.hamLine} />
          <View style={styles.hamLine} />
          <View style={styles.hamLine} />
        </TouchableOpacity>
        
        <Image 
          source={require('../../assets/d-icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Right: Search + User circle (Figma shows search + user, no bell) */}
      <View style={styles.rightGroup}>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Search size={26} color={colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.userCircle} onPress={() => navigation.navigate('Settings')}>
          <User size={20} color={colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
    backgroundColor: 'transparent',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  hamburger: {
    gap: 6,
  },
  hamLine: {
    width: 26,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  logo: {
    width: 40,
    height: 40,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  userCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
