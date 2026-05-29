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

export default function DashboardPage() {
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
      console.error('Failed to load job title stats:', err);
    }
  }, []);

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
        console.error('Failed to load dashboard insights:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Calculate max department salary for horizontal bar rendering
  const maxDeptAvg = Math.max(
    ...(summary?.departmentStats.map((d) => d.avgSalary) ?? [1]),
    1
  );

  // Calculate max job average salary for horizontal bar rendering
  const maxJobAvg = Math.max(
    ...(jobStats.map((j) => j.avgSalary) ?? [1]),
    1
  );

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
        {/* KPI 1: Active Headcount */}
        <div className="glass-interactive p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Headcount
            </p>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {summary?.totalActiveHeadcount.toLocaleString()}
            </h2>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              Active organization staff
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* KPI 2: Total Active Payroll */}
        <div className="glass-interactive p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Payroll
            </p>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {formatSalary(summary?.totalActivePayroll ?? 0)}
            </h2>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Total active annual budget
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-accent-foreground" />
          </div>
        </div>

        {/* KPI 3: Global Average Salary */}
        <div className="glass-interactive p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Salary
            </p>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {formatSalary(summary?.globalAverageSalary ?? 0)}
            </h2>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" />
              Mean organization payout
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <Award className="w-6 h-6 text-warning" />
          </div>
        </div>

        {/* KPI 4: Inactive Status Headcount */}
        <div className="glass-interactive p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Inactive Staff
            </p>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {summary?.totalInactiveHeadcount.toLocaleString()}
            </h2>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
              Inactive/Archived profiles
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Activity className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Average Salaries Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="text-md font-bold text-foreground">Department Salaries</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-5">
            {summary?.departmentStats.map((dept) => {
              const percent = (dept.avgSalary / maxDeptAvg) * 100;
              return (
                <div key={dept.department} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{dept.department}</span>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">{formatSalary(dept.avgSalary)}</strong> avg{' '}
                      <span className="text-[10px]">({dept.count} {dept.count === 1 ? 'employee' : 'employees'})</span>
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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

          <div className="flex-1 flex flex-col justify-center gap-5">
            {jobStats.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">
                No job title insights found.
              </p>
            ) : (
              jobStats.map((job) => {
                const percent = (job.avgSalary / maxJobAvg) * 100;
                return (
                  <div key={job.jobTitle} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{job.jobTitle}</span>
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{formatSalary(job.avgSalary)}</strong> avg{' '}
                        <span className="text-[10px]">({job.count} {job.count === 1 ? 'employee' : 'employees'})</span>
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
