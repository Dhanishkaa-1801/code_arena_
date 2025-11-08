'use client';

import Papa from 'papaparse';

// This type mirrors the structure of your leaderboard data
type LeaderboardEntry = {
  rank: number;
  full_name: string | null;
  roll_no: string | null;
  department: string | null;
  year: number | null;
  problems_solved: number;
  penalty_time: string; // The formatted string e.g., "00:18:50"
  best_execution_time: string; // The formatted string e.g., "0.010s"
  best_memory: string; // The formatted string e.g., "3576 KB"
};

interface DownloadResultsButtonProps {
  data: LeaderboardEntry[];
  contestName: string;
}

export default function DownloadResultsButton({ data, contestName }: DownloadResultsButtonProps) {
  
  const handleDownload = () => {
    // --- THIS IS THE CORRECTED MAPPING ---
    // It now includes all fields from the leaderboard table.
    const csvData = data.map(entry => ({
      'Rank': entry.rank,
      'Name': entry.full_name,
      'Roll No': entry.roll_no,
      'Department': entry.department,
      'Year': entry.year,
      'Score': entry.problems_solved,
      'Penalty Time': entry.penalty_time,
      'Best Execution Time (s)': entry.best_execution_time.replace('s', ''),
      'Best Memory (KB)': entry.best_memory.replace(' KB', ''),
    }));

    // Use PapaParse to convert the JSON array to a CSV string
    const csv = Papa.unparse(csvData);

    // Create a blob and trigger the browser download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    // Sanitize contest name for a clean filename
    const safeContestName = contestName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${safeContestName}_leaderboard.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-arena-mint/20 text-arena-mint font-bold py-2 px-4 rounded-md hover:bg-arena-mint/30 transition-colors"
    >
      Download Results (CSV)
    </button>
  );
}