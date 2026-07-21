// DEMO FEATURE: delete this entire file if demo mode is retired
export const DEMO_DEFAULT_PROJECT_ID = 20 // Cavite Residential Complex

export const DEMO_CREDENTIALS = {
  owner: {
    email: 'demo.owner@sitesync.com',
    password: 'demo1234',
    label: 'Owner',
  },
  pm: {
    email: 'demo.pm@sitesync.com',
    password: 'demo1234',
    label: 'Project Manager',
  },
  worker: {
    email: 'demo.worker@sitesync.com',
    password: 'demo1234',
    label: 'Site Worker',
  },
} as const

export type DemoRole = keyof typeof DEMO_CREDENTIALS
