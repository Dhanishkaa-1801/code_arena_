'use server';

import { createClient } from '@/utils/supabase/server';

// Log a tab switch
export async function logTabSwitch(contestId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existingRecord } = await supabase
    .from('contest_monitoring')
    .select('id, tab_switches')
    .eq('user_id', user.id)
    .eq('contest_id', contestId)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existingRecord) {
    await supabase
      .from('contest_monitoring')
      .update({
        tab_switches: (existingRecord.tab_switches ?? 0) + 1,
        last_warning_at: now,
      })
      .eq('id', existingRecord.id);
  } else {
    await supabase.from('contest_monitoring').insert({
      user_id: user.id,
      contest_id: contestId,
      tab_switches: 1,
      run_count: 0,
      first_opened_at: now,
      last_warning_at: now,
    });
  }
}

// Increment run button counter
export async function incrementRunCount(contestId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existingRecord } = await supabase
    .from('contest_monitoring')
    .select('id, run_count')
    .eq('user_id', user.id)
    .eq('contest_id', contestId)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existingRecord) {
    await supabase
      .from('contest_monitoring')
      .update({
        run_count: (existingRecord.run_count ?? 0) + 1,
        last_warning_at: now,
      })
      .eq('id', existingRecord.id);
  } else {
    await supabase.from('contest_monitoring').insert({
      user_id: user.id,
      contest_id: contestId,
      tab_switches: 0,
      run_count: 1,
      first_opened_at: now,
      last_warning_at: now,
    });
  }
}

// Record the first time a user actually opened a contest problem
export async function markContestOpened(contestId: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existingRecord } = await supabase
    .from('contest_monitoring')
    .select('id, first_opened_at')
    .eq('user_id', user.id)
    .eq('contest_id', contestId)
    .maybeSingle();

  const now = new Date().toISOString();

  if (!existingRecord) {
    await supabase.from('contest_monitoring').insert({
      user_id: user.id,
      contest_id: contestId,
      first_opened_at: now,
      tab_switches: 0,
      run_count: 0,
      last_warning_at: now,
    });
  } else if (!existingRecord.first_opened_at) {
    await supabase
      .from('contest_monitoring')
      .update({ first_opened_at: now })
      .eq('id', existingRecord.id);
  }
}