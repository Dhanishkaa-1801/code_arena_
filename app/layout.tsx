import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Arena - Coding Platform",
  description: "To make coding competitions easier",
  // FORCED ICON: Ensures Vercel sees the icon.svg in your public folder
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap" rel="stylesheet" />
      </head>
      {/* Changed bg-dark-bg to the specific deep #020617 for a seamless look */}
      <body className="bg-[#020617] text-gray-100">{children}</body>
    </html>
  );
}