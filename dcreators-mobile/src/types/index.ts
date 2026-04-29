// ============================================
// DCreators TypeScript Types
// Master type definitions for all entities
// ============================================

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  pin: string | null;
  avatar_url: string | null;
  has_consultant_profile: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsultantProfile {
  id: string;
  user_id: string;
  display_name: string;
  code: string;
  category: ConsultantCategory;
  subtitle: string | null;
  experience: string | null;
  expertise: string | null;
  bio: string | null;
  avatar_url: string | null;
  portfolio_images: string[] | null;
  base_price: number | null;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ConsultantCategory = 'photographer' | 'designer' | 'sculptor' | 'artisan';

export type UserRole = 'client' | 'consultant';

export type ProjectStatus =
  | 'pending'
  | 'accepted'
  | 'advance_paid'
  | 'in_progress'
  | 'review_1'
  | 'review_2'
  | 'final_review'
  | 'approved'
  | 'balance_paid'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired';

export interface Project {
  id: string;
  client_id: string;
  consultant_id: string;
  assignment_type: string;
  assignment_details: string[] | null;
  assignment_brief: string;
  deadline: string | null;
  budget: number;
  status: ProjectStatus;
  progress_percent: number;
  milestone_1_date: string | null;
  milestone_2_date: string | null;
  final_date: string | null;
  final_offer: number | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  project_id: string;
  round: 'review_1' | 'review_2' | 'final';
  files: string[];
  consultant_note: string | null;
  selected_option: number | null;
  feedback_colour: boolean;
  feedback_concept: boolean;
  feedback_design_look: boolean;
  feedback_text: string | null;
  client_action: 'approve' | 'revert' | 'hold' | 'cancel' | null;
  created_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  payer_id: string;
  amount: number;
  payment_type: 'advance' | 'balance' | 'shop_purchase';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'assignment' | 'payment' | 'review' | 'system';
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface ShopProduct {
  id: string;
  consultant_id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[] | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FloatingQuery {
  id: string;
  client_id: string;
  assignment_type: string;
  assignment_brief: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: 'open' | 'closed' | 'expired';
  created_at: string;
}

export interface FloatingQueryResponse {
  id: string;
  query_id: string;
  consultant_id: string;
  proposed_price: number | null;
  proposed_timeline: string | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  sort_order: number;
}
