import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Arena - Coding Platform",
  description: "To make coding competitions easier",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome */}
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
        {/* Added handwriting font for landing page annotations */}
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-dark-bg text-gray-100">{children}</body>
    </html>
  );
}