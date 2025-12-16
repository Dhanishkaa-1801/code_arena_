'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const full_name = formData.get('full_name') as string
  const roll_no = formData.get('roll_no') as string
  const department = formData.get('department') as string
  const year = formData.get('year') as string
  const section = formData.get('section') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      roll_no,
      department,
      year: parseInt(year),
      section
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/profile')
  return { success: true }
}