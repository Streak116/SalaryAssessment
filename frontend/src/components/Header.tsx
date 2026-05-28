'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Bell, Search, Settings } from 'lucide-react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or document class list
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <header className="h-[var(--header-height)] bg-white border-b border-border flex items-center justify-between px-8 z-10 dark:bg-card">
      {/* Title & Path description */}
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-foreground tracking-tight">Organization Overview</h1>
        <p className="text-xs text-muted-foreground">Salary Assessment & Employee Insights</p>
      </div>

      {/* Toolbar / Actions */}
      <div className="flex items-center gap-4">
        {/* Search Input Placeholder */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Quick search..."
            className="pl-9 pr-4 py-1.5 w-60 rounded-full border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-muted/20 hover:bg-muted/40 transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors relative group"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 transition-transform duration-200 group-hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 transition-transform duration-200 group-hover:-rotate-12" />
          )}
        </button>

        <button
          aria-label="Notifications"
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>

        <div className="w-[1px] h-6 bg-border" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-sm text-white">
            JD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground">John Doe</p>
            <p className="text-[10px] text-muted-foreground">HR Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
