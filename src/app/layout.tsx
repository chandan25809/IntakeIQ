import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IntakeIQ · Client Upload Companion",
  description:
    "An AI-powered, client-facing intake companion that helps law-firm clients upload the right documents without the back-and-forth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
