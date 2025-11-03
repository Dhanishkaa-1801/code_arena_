export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'python' | 'javascript' | 'c' | 'cpp' | 'java';

export interface Problem {
  id: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  acceptance: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
}

export interface Contest {
  id: string;
  title: string;
  status: 'active' | 'upcoming' | 'finished';
  description: string;
  duration?: string;
  participants?: number;
  startsIn?: string;
  winner?: string;
  difficulty?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  rollNo: string;
  year: number;
  department: string;
  timeTaken: string;
  executionTime: string;
}

export interface TestCase {
  input: string;
  expected: string;
  output: string;
  passed: boolean;
}

export interface Activity {
  action: string;
  title: string;
  time: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  details: string;
  colorClass: string;
}