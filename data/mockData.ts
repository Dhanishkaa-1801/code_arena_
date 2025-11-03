import { Problem, Contest, LeaderboardEntry, Activity, DashboardStat } from '@/types';

export const PROBLEMS: Problem[] = [
  { id: 'sum-two-numbers', number: 1, title: 'Sum of Two Numbers', difficulty: 'easy', acceptance: '85%', description: 'Write a program that takes two numbers as input and returns their sum.', inputFormat: 'Two space-separated integers', outputFormat: 'A string in the format: "Sum = X" where X is the sum', sampleInput: '5 7', sampleOutput: 'Sum = 12', },
  { id: 'reverse-string', number: 2, title: 'Reverse String', difficulty: 'easy', acceptance: '78%', description: 'Write a program that reverses a given string.', inputFormat: 'A single string', outputFormat: 'The reversed string', sampleInput: 'hello', sampleOutput: 'olleh', },
  { id: 'fibonacci', number: 3, title: 'Fibonacci Sequence', difficulty: 'medium', acceptance: '65%', description: 'Generate the first N numbers of the Fibonacci sequence.', inputFormat: 'A single integer N', outputFormat: 'N Fibonacci numbers separated by spaces', sampleInput: '5', sampleOutput: '0 1 1 2 3', },
];

export const CONTESTS: Contest[] = [
    { id: '1', title: 'Weekly Challenge #45', status: 'active', description: 'Solve algorithmic problems and compete with other programmers.', duration: '2 hours', participants: 1234, },
    { id: '2', title: "Beginner's Arena", status: 'upcoming', description: 'Perfect for newcomers to competitive programming.', startsIn: '2 days', difficulty: 'Easy', },
    { id: '3', title: 'Algorithm Masters', status: 'finished', description: 'Advanced algorithms and data structures challenge.', winner: 'CodeMaster', participants: 856, },
];

export const LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
    { rank: 1, name: 'XXX', rollNo: '71812401001', year: 2, department: 'CSE', timeTaken: '45.23s', executionTime: '0.12s' },
    { rank: 2, name: 'YYY', rollNo: '71812401002', year: 2, department: 'CSE', timeTaken: '52.67s', executionTime: '0.15s' },
    { rank: 3, name: 'ZZZ', rollNo: '71812401003', year: 2, department: 'CSE', timeTaken: '58.91s', executionTime: '0.18s' },
];

export const DASHBOARD_STATS: DashboardStat[] = [
    { label: "Problems Solved", value: "12", details: "Total submissions: 24", colorClass: "text-arena-pink" },
    { label: "Success Rate", value: "85%", details: "20 successful submissions", colorClass: "text-arena-mint" },
    { label: "Global Rank", value: "#24", details: "Top 5% of programmers", colorClass: "text-arena-blue" }
];

export const RECENT_ACTIVITIES: Activity[] = [
    { action: 'Solved', title: 'Sum of Two Numbers (Easy)', time: '2 hours ago' },
    { action: 'Submitted', title: 'Reverse String (Easy)', time: '1 day ago' },
    { action: 'Joined', title: 'Weekly Challenge #44', time: '3 days ago' },
];