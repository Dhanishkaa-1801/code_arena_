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
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="bg-dark-bg text-gray-100">{children}</body>
    </html>
  );
}