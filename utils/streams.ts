export function getStreamFromDepartment(dept: string | null): '1' | '2' | '3' {
  if (!dept) return '3';
  const d = dept.toUpperCase();

  // Stream 1: Core/General
  if (['AERO', 'BME', 'CIVIL', 'MECH', 'R&A'].includes(d)) return '1';

  // Stream 2: Electrical
  if (['ECE', 'EEE', 'EIE'].includes(d)) return '2';

  // Stream 3: Comp/IT
  if (['CSE', 'IT', 'AIDS', 'AI&DS', 'MTECH', 'M.TECH'].includes(d)) return '3';

  return '3'; // Default fallback
}