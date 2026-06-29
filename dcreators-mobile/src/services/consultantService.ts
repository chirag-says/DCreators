// ============================================
// Consultant Service
// All Supabase queries related to consultant profiles
// ============================================

import { supabase } from '../lib/supabase';
import type { ConsultantProfile } from '../types';

/**
 * Fetch all active consultant profiles for the dashboard.
 * Returns typed ConsultantProfile array, never throws.
 */
export async function fetchActiveConsultants(): Promise<ConsultantProfile[]> {
  const { data, error } = await supabase
    .from('consultant_profiles')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[ConsultantService] fetchActiveConsultants error:', error.message);
    return [];
  }

  return (data ?? []) as ConsultantProfile[];
}

/**
 * Fetch trending consultants (most recent active profiles).
 */
export async function fetchTrendingConsultants(limit = 6): Promise<ConsultantProfile[]> {
  const { data, error } = await supabase
    .from('consultant_profiles')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[ConsultantService] fetchTrendingConsultants error:', error.message);
    return [];
  }

  return (data ?? []) as ConsultantProfile[];
}

/**
 * Search consultants by query and/or category.
 */
export async function searchConsultants(params: {
  query?: string;
  category?: string | null;
  limit?: number;
}): Promise<ConsultantProfile[]> {
  const { query, category, limit = 20 } = params;

  let request = supabase
    .from('consultant_profiles')
    .select('*')
    .eq('is_active', true);

  if (category) {
    request = request.eq('category', category);
  }

  if (query?.trim()) {
    request = request.or(
      `display_name.ilike.%${query}%,expertise.ilike.%${query}%,subtitle.ilike.%${query}%`
    );
  }

  const { data, error } = await request.limit(limit);

  if (error) {
    console.error('[ConsultantService] searchConsultants error:', error.message);
    return [];
  }

  return (data ?? []) as ConsultantProfile[];
}

/**
 * Fetch approved, active consultants for collaboration invites (most recently joined first).
 */
export async function fetchApprovedConsultants(limit = 10): Promise<ConsultantProfile[]> {
  const { data, error } = await supabase
    .from('consultant_profiles')
    .select('*')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[ConsultantService] fetchApprovedConsultants error:', error.message);
    return [];
  }

  return (data ?? []) as ConsultantProfile[];
}

/**
 * Sync a consultant's portfolio thumbnail/card/banner images on their profile,
 * derived from their most recent shop_products. Client-facing screens read
 * portfolio images off consultant_profiles, not shop_products directly.
 */
export async function syncConsultantPortfolioImages(consultantId: string, maxSlots: number): Promise<void> {
  const { data } = await supabase
    .from('shop_products')
    .select('images, image_variants')
    .eq('consultant_id', consultantId)
    .order('created_at', { ascending: false })
    .limit(maxSlots);

  const rows = data ?? [];
  const squareImages = rows.map((p: any) => p.image_variants?.square ?? p.images?.[0]).filter(Boolean);
  const primary = rows[0] as any;
  const cardImage = primary?.image_variants?.card ?? primary?.images?.[0] ?? null;
  const bannerImage = primary?.image_variants?.banner ?? primary?.images?.[0] ?? null;

  const { error } = await supabase.from('consultant_profiles').update({
    portfolio_images: squareImages,
    portfolio_card_image: cardImage,
    portfolio_banner_image: bannerImage,
  }).eq('id', consultantId);

  if (error) {
    console.error('[ConsultantService] syncConsultantPortfolioImages error:', error.message);
  }
}

/**
 * Create or update a consultant profile during onboarding (KYC + banking details).
 * Keyed on user_id; safe to call again if onboarding is retried.
 */
export async function upsertConsultantProfile(profile: {
  user_id: string;
  display_name: string;
  code: string;
  experience: string | null;
  institution_name: string | null;
  avatar_url: string | null;
  aadhar_number: string;
  pan_number: string;
  bank_name: string;
  ifsc_code: string;
  bank_account_number: string;
  terms_pdf_url: string | null;
}): Promise<void> {
  const { error } = await supabase.from('consultant_profiles').upsert({
    ...profile,
    is_approved: false,
    is_active: true,
  }, { onConflict: 'user_id', ignoreDuplicates: false });

  if (error) {
    throw new Error(error.message);
  }
}

/** Mark a consultant profile as approved (e.g. after completing onboarding). */
export async function approveConsultantProfile(consultantId: string): Promise<void> {
  const { error } = await supabase.from('consultant_profiles').update({ is_approved: true }).eq('id', consultantId);
  if (error) {
    throw new Error(error.message);
  }
}
