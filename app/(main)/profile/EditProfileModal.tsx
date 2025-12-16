'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { Pencil, X, Loader2 } from 'lucide-react'

type ProfileData = {
  full_name: string | null
  roll_no: string | null
  department: string | null
  year: number | null
  section: string | null
}

// Full list of department options as per project context
const departmentOptions = [
  'CSE', 'IT', 'MECH', 'MTECH', 'AERO', 'EEE', 'ECE', 'BME', 'R&A', 'EIE', 'CIVIL', 'AI&DS'
]

export default function EditProfileModal({ profile }: { profile: ProfileData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    await updateProfile(formData)
    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 border border-border-color rounded-lg text-sm hover:bg-white/5 hover:text-white text-gray-300 transition flex items-center gap-2"
      >
        <Pencil size={14} />
        Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg border border-border-color rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                <input name="full_name" defaultValue={profile.full_name || ''} required className="w-full bg-dark-bg border border-border-color rounded p-2 text-sm text-white focus:border-arena-blue outline-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Roll No</label>
                <input name="roll_no" defaultValue={profile.roll_no || ''} className="w-full bg-dark-bg border border-border-color rounded p-2 text-sm text-white focus:border-arena-blue outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
                  <select name="department" defaultValue={profile.department || 'CSE'} className="w-full bg-dark-bg border border-border-color rounded p-2 text-sm text-white focus:border-arena-blue outline-none">
                     {/* --- MODIFIED SECTION START --- */}
                     {departmentOptions.map(dept => (
                       <option key={dept} value={dept}>{dept}</option>
                     ))}
                     {/* --- MODIFIED SECTION END --- */}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Year</label>
                  <select name="year" defaultValue={profile.year || 1} className="w-full bg-dark-bg border border-border-color rounded p-2 text-sm text-white focus:border-arena-blue outline-none">
                     <option value="1">1</option>
                     <option value="2">2</option>
                     <option value="3">3</option>
                     <option value="4">4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Section</label>
                <input name="section" defaultValue={profile.section || ''} className="w-full bg-dark-bg border border-border-color rounded p-2 text-sm text-white focus:border-arena-blue outline-none" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-6 py-2 bg-arena-blue text-dark-bg font-bold rounded text-sm hover:bg-arena-blue/90 flex items-center gap-2">
                  {isLoading && <Loader2 className="animate-spin" size={14} />}
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}