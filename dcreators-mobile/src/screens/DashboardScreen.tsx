// ============================================
// DashboardScreen — Thin router
// Branches on currentRole:
//   consultant → CreatorDashboardScreen  ("Creators Dashboard - Final" portfolio grid)
//   client     → ClientDashboard          ("Explore Creative Consultant's Portfolio")
//
// ⚠️ PART A RULE: "Creator's Dashboard" = CONSULTANT only.
//               "Open Gallery Dashboard"  = CLIENT only.
//               Never swap these.
// ============================================

import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import CreatorDashboardScreen from './CreatorDashboardScreen';
import ClientDashboard from '../components/dashboard/ClientDashboard';
import type { MainTabScreenProps } from '../types/navigation';

export default function DashboardScreen({ navigation }: MainTabScreenProps<'Dashboard'>) {
  const currentRole = useAuthStore((s) => s.currentRole);

  if (currentRole === 'consultant') {
    // Consultant home = "Creators Dashboard - Final" (portfolio grid + Sales/Project toggle)
    return <CreatorDashboardScreen navigation={navigation} />;
  }

  // Client home = "Explore Creative Consultant's Portfolio" hub
  return <ClientDashboard navigation={navigation} />;
}
