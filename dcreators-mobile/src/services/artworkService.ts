// ============================================
// Artwork Service
// All Supabase queries related to artwork_orders and artwork_payments
// ============================================

import { supabase } from '../lib/supabase';
import type { ArtworkOrder, ArtworkOrderStatus } from '../types';

/**
 * Fetch a single artwork order by ID with a caller-specified join shape.
 * Different screens need different joined columns (buyer vs artist profile).
 */
export async function fetchArtworkOrderById(orderId: string, select: string): Promise<ArtworkOrder> {
  const { data, error } = await supabase
    .from('artwork_orders')
    .select(select)
    .eq('id', orderId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as ArtworkOrder;
}

/**
 * Update an artwork order's status and any extra fields (e.g. consignment_no).
 */
export async function updateArtworkOrderStatus(
  orderId: string,
  status: ArtworkOrderStatus,
  extraFields?: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from('artwork_orders')
    .update({ status, updated_at: new Date().toISOString(), ...extraFields })
    .eq('id', orderId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Record a completed payment (advance or balance) against an artwork order.
 */
export async function recordArtworkPayment(payment: {
  order_id: string;
  payer_id: string;
  amount: number;
  payment_type: 'artwork_advance' | 'artwork_balance';
}): Promise<void> {
  const { error } = await supabase.from('artwork_payments').insert({
    ...payment,
    status: 'completed',
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}
