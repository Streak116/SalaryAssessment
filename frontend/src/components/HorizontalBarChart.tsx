import React from 'react';

interface BarChartItem {
  id: string;
  label: string;
  value: number;
  count: number;
}

interface HorizontalBarChartProps {
  items: BarChartItem[];
  valueFormatter: (v: number) => string;
  gradientClass: string;
  emptyMessage?: string;
}

export default function HorizontalBarChart({
  items,
  valueFormatter,
  gradientClass,
  emptyMessage = 'No data available.',
}: HorizontalBarChartProps) {
  if (items.length === 0) {
    return (
      <p className="text-center text-xs text-muted-foreground py-8">
        {emptyMessage}
      </p>
    );
  }

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex-1 flex flex-col justify-center gap-5">
      {items.map((item) => {
        const percent = (item.value / maxValue) * 100;
        return (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{item.label}</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{valueFormatter(item.value)}</strong> avg{' '}
                <span className="text-[10px]">({item.count} {item.count === 1 ? 'employee' : 'employees'})</span>
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${gradientClass} h-full rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
