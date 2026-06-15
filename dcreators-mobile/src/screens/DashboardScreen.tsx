// ============================================
// DashboardScreen — Thin router
// Delegates to role-specific dashboard components
// ============================================

import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import ConsultantDashboard from '../components/dashboard/ConsultantDashboard';
import ClientDashboard from '../components/dashboard/ClientDashboard';
import type { MainTabScreenProps } from '../types/navigation';

export default function DashboardScreen({ navigation }: MainTabScreenProps<'Dashboard'>) {
  const currentRole = useAuthStore((s) => s.currentRole);

  if (currentRole === 'consultant') {
    return <ConsultantDashboard navigation={navigation} />;
  }

  return <ClientDashboard navigation={navigation} />;
}
