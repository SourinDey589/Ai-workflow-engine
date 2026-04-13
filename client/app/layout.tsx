import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Workflow Engine",
  description: "Submit and track requests powered by AI triage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <span className="text-xl font-bold text-indigo-600">
            ⚡ AI Workflow Engine
          </span>
          <div className="flex gap-6">
            <a
              href="/submit"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Submit
            </a>
            <a
              href="/dashboard"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Dashboard
            </a>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  );
}
