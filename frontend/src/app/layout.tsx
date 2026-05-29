import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { DialogProvider } from "@/context/DialogContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SalaryPro - Organisation Salary Assessment Tool",
  description: "Advanced analytics and management for organization payroll and employee compensation profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-background text-foreground flex overflow-hidden">
        <DialogProvider>
          {/* Left Sidebar */}
          <Sidebar />

          {/* Right Main Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-background p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </DialogProvider>
      </body>
    </html>
  );
}
