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

    const fullName = formData.get('fullName') as string;
    const rollNo = formData.get('rollNo') as string;
    const department = formData.get('department') as string;
    const year = parseInt(formData.get('year') as string, 10);
    const section = formData.get('section') as string;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        roll_no: rollNo,
        department,
        year,
        section,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return redirect('/setup-profile?error=update_failed');
    }

    // Revalidate the path to ensure middleware re-evaluates correctly on next navigation
    revalidatePath('/', 'layout');
    return redirect('/contests');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-lg p-8 bg-card-bg border border-border-color rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-100">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Welcome to Code Arena! Please provide a few more details to get
            started.
          </p>
        </div>

        <form action={updateProfile} className="space-y-6">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-300"
            >
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={user.user_metadata?.full_name ?? ''}
              className="mt-1 block w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink"
            />
          </div>

          <div>
            <label
              htmlFor="rollNo"
              className="block text-sm font-medium text-gray-300"
            >
              Roll Number-7181...
            </label>
            <input
              id="rollNo"
              name="rollNo"
              type="text"
              required
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
                  Select Department
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
                className="mt-1 block w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-dark-bg bg-gradient-to-r from-arena-pink to-arena-blue hover:opacity-90"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}