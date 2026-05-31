/**
 * Frontend constants matching backend seed lists.
 */

export const COUNTRIES = [
  'Australia',
  'Brazil',
  'Canada',
  'France',
  'Germany',
  'India',
  'Japan',
  'Singapore',
  'UK',
  'USA',
];

export const DEPARTMENTS = [
  'Customer Success',
  'Design',
  'Engineering',
  'Finance',
  'HR',
  'Legal',
  'Marketing',
  'Operations',
  'Product',
  'Sales',
];

export const JOB_TITLES_BY_DEPT: Record<string, string[]> = {
  Engineering: [
    'Software Engineer',
    'Senior Software Engineer',
    'Engineering Manager',
    'QA Engineer',
    'DevOps Engineer',
  ],
  Product: [
    'Product Manager',
    'Senior Product Manager',
    'VP of Product',
  ],
  Design: [
    'UI/UX Designer',
    'Senior Designer',
    'Art Director',
  ],
  Marketing: [
    'Marketing Specialist',
    'Growth Marketer',
    'Marketing Director',
  ],
  Sales: [
    'Account Executive',
    'Sales Representative',
    'Sales Director',
  ],
  HR: [
    'HR Specialist',
    'HR Manager',
    'VP of HR',
  ],
  Finance: [
    'Accountant',
    'Financial Analyst',
    'CFO',
  ],
  Operations: [
    'Operations Coordinator',
    'Operations Manager',
    'COO',
  ],
  Legal: [
    'Legal Counsel',
    'General Counsel',
  ],
  'Customer Success': [
    'Success Specialist',
    'Success Manager',
  ],
};

export const ALL_JOB_TITLES = Object.values(JOB_TITLES_BY_DEPT).flat();

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contractor',
  'Intern',
];

export const GENDERS = [
  'Male',
  'Female',
  'Non-binary',
];
