import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconClass?: string;
  iconBgClass: string;
  subText: string;
  dotColorClass?: string;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  iconClass = "text-primary",
  iconBgClass,
  subText,
  dotColorClass,
}: KPICardProps) {
  return (
    <div className="glass-interactive p-6 rounded-2xl flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
          {value}
        </h2>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          {dotColorClass && (
            <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass} inline-block`} />
          )}
          {subText}
        </p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${iconBgClass} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconClass}`} />
      </div>
    </div>
  );
}
