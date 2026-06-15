// ============================================
// DCreators Navigation Types
// Strict type definitions for all route params
// ============================================

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { Project, ConsultantProfile, ShopProduct } from './index';

// ─── Dashboard Creator View Model ────────────────────────────
export interface CreatorCardViewModel {
  id: string;
  name: string;
  code: string;
  subtitle: string;
  experience: string;
  expertise: string;
  avatar_public_id: string;
  avatar_url?: string | null;
  portfolio_images?: string[] | null;
  category: string;
  base_price: number | null;
  is_approved: boolean;
  user_id: string;
}

// ─── Root Stack (all screens) ────────────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  EmailLogin: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string };
  Intro: undefined;
  CreatorOnboarding: undefined;
  ClientOnboarding: undefined;

  // Main tab navigator
  Main: NavigatorScreenParams<MainTabParamList>;

  // Sub-screens
  Settings: undefined;
  EditProfile: undefined;
  EditConsultantProfile: undefined;
  AssignMultiple: { consultantIds?: string[] };
  Terms: undefined;
  FinalizeOffer: { project: Project };
  ClientWorkorder: { project: Project };
  ClientReview: { project: Project };
  CollaborationDashboard: { project: Project };
  Payment: { project: Project; paymentType: 'advance' | 'balance' };

  // Modals
  Filter: undefined;
  PortfolioGallery: { images: string[]; initialIndex?: number };

  // Full-screen features
  Notifications: undefined;
  Chat: { project: Project; otherName: string };
  Invoice: { project: Project };
  SavedCreators: undefined;
  RatingReview: { project: Project };
  Shop: undefined;
  ProductDetails: { product: ShopProduct & { consultant_profiles?: { display_name: string; code: string } } };
  Menu: undefined;
  MessagesList: undefined;
  MyProducts: undefined;
  AddEditProduct: { product?: ShopProduct } | undefined;
};

// ─── Main Tab Navigator ──────────────────────────────────────
export type MainTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  History: undefined;
  CreatorProfile: { creator: CreatorCardViewModel };
  AssignProject: { consultant: CreatorCardViewModel };
  FloatingQuery: undefined;
  CreatorWorkorder: { project: Project };
};

// ─── Screen Props Helpers ────────────────────────────────────
// Use these to type individual screen components.
//
// Example:
//   function DashboardScreen({ navigation, route }: MainTabScreenProps<'Dashboard'>) { ... }

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
