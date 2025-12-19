import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Reuse the same department options as EditProfileModal
const departmentOptions = [
  'CSE',
  'IT',
  'MECH',
  'MTECH',
  'AERO',
  'EEE',
  'ECE',
  'BME',
  'R&A',
  'EIE',
  'CIVIL',
  'AI&DS',
];

export default async function SetupProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Server Action to handle form submission
  const updateProfile = async (formData: FormData) => {
    'use server';

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect('/login?error=user_not_found');
    }

    // 1. FORCED OFFICIAL NAME: Pull directly from Auth Metadata for security
    const officialName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

    // 2. Extract other fields
    const rollNo = formData.get('rollNo') as string;
    const department = formData.get('department') as string;
    const yearStr = formData.get('year') as string;
    const section = formData.get('section') as string;

    // 3. STRICT VALIDATION: Ensure everything is filled
    if (!rollNo || !department || !yearStr || !section || rollNo.trim() === '' || section.trim() === '') {
      return redirect('/setup-profile?error=all_fields_mandatory');
    }

    const year = parseInt(yearStr, 10);

    // 4. USE UPSERT: Creates the row if it doesn't exist, updates if it does
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id, // Primary Key
        full_name: officialName, // Use official name, ignoring form input for security
        roll_no: rollNo.trim(),
        department,
        year,
        section: section.trim(),
        profile_complete: true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating profile:', error);
      return redirect('/setup-profile?error=update_failed');
    }

    // Revalidate the path to ensure middleware re-evaluates correctly on next navigation
    revalidatePath('/', 'layout');
    return redirect('/contests');
  };

  // Get current name for the read-only display
  const currentName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-lg p-8 bg-card-bg border border-border-color rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-100">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Welcome to Code Arena! All fields are mandatory to continue.
          </p>
        </div>

        <form action={updateProfile} className="space-y-6">
          {/* FULL NAME - READ ONLY */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-400"
            >
              Full Name (Locked)
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              readOnly
              value={currentName}
              className="mt-1 block w-full bg-[#020617] border border-border-color rounded-md p-3 text-gray-500 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="rollNo"
              className="block text-sm font-medium text-gray-300"
            >
              Roll Number
            </label>
            <input
              id="rollNo"
              name="rollNo"
              type="text"
              required
              placeholder="e.g. 7181..."
              className="mt-1 block w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department dropdown */}
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-300"
              >
                Department
              </label>
              <select
                id="department"
                name="department"
                required
                className="mt-1 block w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink"
                defaultValue=""
              >
                <option value="" disabled>
                  Select
                </option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Year dropdown */}
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-300"
              >
                Year
              </label>
              <select
                id="year"
                name="year"
                required
                className="mt-1 block w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink"
                defaultValue="1"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="section"
                className="block text-sm font-medium text-gray-300"
              >
                Section
              </label>
              <input
                id="section"
                name="section"
                type="text"
                required
                placeholder="e.g. A"
                className="mt-1 block w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-dark-bg bg-gradient-to-r from-arena-pink to-arena-blue hover:opacity-90 transition-transform active:scale-95"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}