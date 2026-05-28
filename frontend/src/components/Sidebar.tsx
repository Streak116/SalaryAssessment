'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, TrendingUp, DollarSign } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
    },
  ];

  return (
    <aside className="w-[var(--sidebar-width)] flex-shrink-0 bg-white border-r border-border flex flex-col h-full dark:bg-card">
      {/* Brand Header */}
      <div className="h-[var(--header-height)] flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/10 transition-transform duration-300 group-hover:scale-105">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            SalaryPro
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {/* Left active accent line */}
              {isActive && (
                <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary" />
              )}
              <Icon
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / System Meta */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary font-mono">V1</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Salary Management</p>
            <p className="text-[10px] text-muted-foreground">Admin Workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
