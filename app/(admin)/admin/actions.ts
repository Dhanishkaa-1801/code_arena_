'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Updates the 'is_practice_available' status for a specific problem.
 * This action is protected by middleware to ensure only admins can call it.
 */
export async function togglePracticeStatus(
  problemId: number,
  newStatus: boolean,
  contestId: string
) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('contest_problems')
    .update({ is_practice_available: newStatus })
    .eq('id', problemId);

  if (error) {
    console.error('Error updating practice status:', error);
    // In a real app, you'd return an error object here
    // For now, we'll just log it.
    return { success: false, error: error.message };
  }

  // Revalidate the admin page to show the new toggle state
  revalidatePath(`/admin/contests/${contestId}`);
  // Revalidate the future practice zone page
  revalidatePath('/problems');

  return { success: true };
}