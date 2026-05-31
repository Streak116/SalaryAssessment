'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Globe, 
  Activity, 
  Briefcase, 
  Award,
  Layers 
} from 'lucide-react';
import { 
  getDashboardSummary, 
  getCountryStats, 
  getJobTitleStats 
} from '../lib/api';
import type { 
  DashboardSummary, 
  CountryStat, 
  JobTitleStat 
} from '../lib/api';
import KPICard from '@/components/KPICard';
import HorizontalBarChart from '@/components/HorizontalBarChart';
import { useDialog } from '@/context/DialogContext';

export default function DashboardPage() {
  const { showDialog } = useDialog();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [countryStats, setCountryStats] = useState<CountryStat[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [jobStats, setJobStats] = useState<JobTitleStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobStats = useCallback(async (country: string) => {
    try {
      const stats = await getJobTitleStats(country);
      setJobStats(stats);
    } catch (err) {
      showDialog({
        type: 'warning',
        title: 'Error Fetching Job Title Stats',
        message: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    }
  }, [showDialog]);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setLoading(true);
      try {
        const [summaryData, countriesData] = await Promise.all([
          getDashboardSummary(),
          getCountryStats(),
        ]);
        
        if (!isMounted) return;
        setSummary(summaryData);
        setCountryStats(countriesData);

        if (countriesData.length > 0) {
          const defaultCountry = countriesData[0].country;
          setSelectedCountry(defaultCountry);
          const jobData = await getJobTitleStats(defaultCountry);
          if (!isMounted) return;
          setJobStats(jobData);
        }
      } catch (err) {
        showDialog({
          type: 'warning',
          title: 'Error Loading Dashboard Data',
          message: err instanceof Error ? err.message : 'An unexpected error occurred.',
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, [showDialog]);

  const handleCountryChange = async (country: string) => {
    setSelectedCountry(country);
    await fetchJobStats(country);
  };

  const formatSalary = (n: number) =>
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(n);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-64 bg-muted rounded-lg" />
        </div>

        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-card border border-border rounded-2xl" />
          ))}
        </div>

        {/* Main Panels Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-card border border-border rounded-2xl" />
          <div className="h-96 bg-card border border-border rounded-2xl" />
        </div>
      </div>
    );
  }



  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Salary Insights</h1>
          <p className="text-sm text-muted-foreground">
            Interactive analytics overviewing global organization compensation structures.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Active Headcount"
          value={summary?.totalActiveHeadcount.toLocaleString() ?? '0'}
          icon={Users}
          iconBgClass="bg-primary/10"
          subText="Active organization staff"
          dotColorClass="bg-success"
        />
        <KPICard
          title="Active Payroll"
          value={formatSalary(summary?.totalActivePayroll ?? 0)}
          icon={DollarSign}
          iconClass="text-accent-foreground"
          iconBgClass="bg-accent"
          subText="Total active annual budget"
          dotColorClass="bg-primary"
        />
        <KPICard
          title="Average Salary"
          value={formatSalary(summary?.globalAverageSalary ?? 0)}
          icon={Award}
          iconClass="text-warning"
          iconBgClass="bg-warning/10"
          subText="Mean organization payout"
          dotColorClass="bg-warning"
        />
        <KPICard
          title="Inactive Staff"
          value={summary?.totalInactiveHeadcount.toLocaleString() ?? '0'}
          icon={Activity}
          iconClass="text-muted-foreground"
          iconBgClass="bg-muted"
          subText="Inactive/Archived profiles"
          dotColorClass="bg-muted-foreground/40"
        />
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Average Salaries Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="text-md font-bold text-foreground">Department Salaries</h3>
          </div>
          <HorizontalBarChart
            items={(summary?.departmentStats ?? []).map((d) => ({
              id: d.department,
              label: d.department,
              value: d.avgSalary,
              count: d.count,
            }))}
            valueFormatter={formatSalary}
            gradientClass="from-blue-500 via-indigo-500 to-violet-500"
          />
        </div>

        {/* Job Title Insights per Selected Country */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="text-md font-bold text-foreground">Job Title Salaries</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <label htmlFor="country-selector" className="text-xs font-semibold text-muted-foreground">
                Select Country
              </label>
              <select
                id="country-selector"
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                aria-label="Select Country"
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground cursor-pointer"
              >
                {countryStats.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <HorizontalBarChart
            items={jobStats.map((j) => ({
              id: j.jobTitle,
              label: j.jobTitle,
              value: j.avgSalary,
              count: j.count,
            }))}
            valueFormatter={formatSalary}
            gradientClass="from-violet-500 via-purple-500 to-fuchsia-500"
            emptyMessage="No job title insights found."
          />
        </div>
      </div>

      {/* Country Breakdown Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-md font-bold text-foreground">Global Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {countryStats.map((c) => (
            <div key={c.country} className="glass-interactive p-5 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  {c.country}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {c.count} {c.count === 1 ? 'staff' : 'staff'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Average Salary
                  </p>
                  <p className="text-sm font-bold text-foreground">{formatSalary(c.avgSalary)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Salary Range
                  </p>
                  <p className="text-[11px] font-bold text-foreground leading-relaxed mt-0.5">
                    {formatSalary(c.minSalary)} - {formatSalary(c.maxSalary)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
