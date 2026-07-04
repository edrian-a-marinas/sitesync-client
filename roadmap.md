# SiteSync — Development Roadmap

Documentation started June 7

Agile flow:
Plan -> Design (architecture, data flow, API design) -> Develop -> Test -> Review -> Deploy -> Repeat

Legend:
!! finished and tested -> move on
@@ currently working

## bug

[$$] working, but not yet finished, depends on future changes
%% not yet started
[^^] working, but not yet tested / lacking data to test
&& finished but untested

## Database

1.  Set up local PostgreSQL (use local DB first, migrate to AWS RDS only before deployment) !!
2.  Design all SQLAlchemy models — users, roles, projects, phases, assignments, daily_logs, attendance, materials, equipment, incidents, site_photos, reports, ai_query_history !!
3.  Set up Alembic — initial migration, verify all tables generated correctly on local DB !!
4.  Database indexes — covered by unique constraints !!

## Backend Core

5.  Initialize FastAPI project structure — routers/, services/, schemas/, models/, core/, utils/ !!
6.  Install and configure all dependencies — FastAPI, SQLAlchemy, Alembic, asyncio, asyncpg, Pydantic, python-dotenv, SlowAPI, ruff (linting) !!
7.  Set up DB connection pool — async SQLAlchemy engine pointing to local PostgreSQL !!
8.  Auth — register, login, JWT issue, /me endpoint, role enforcement middleware, /core !!
9.  Users router — CRUD, role assignment, activation/deactivation !!
10. Projects router — create, list, update, assign managers, assign workers, phase management !!
11. Daily Logs router — submit log, list logs per project, get log by date, edit log !!
12. Attendance router — log worker presence per shift, view attendance per project !!
13. Materials router — log material consumption per log, view material history per project !!
14. Equipment router — log equipment deployed per log !!
15. Incidents router — submit incident per log, list incidents per project !!
16. Dashboard KPIs endpoint — cross-project stats for Owner, per-project stats for Manager !!
17. Test all endpoints manually via Postman !!

## Task Layer

18. Install and configure Celery + Redis — connect Redis as broker, verify worker runs !!
19. Weekly report generation task — aggregate logs, compile structured data, generate PDF, store to S3, write metadata to RDS !!
20. Duplicate prevention and error handling after a report has already been generated !!
21. Cache the POST request — if already generated, serve the cached result instead of regenerating; multiple users can reuse one generated report instead of producing duplicates !!
22. Auto-delete reports older than 2 weeks — Celery Beat task deletes old PDFs from S3 and metadata from RDS, Owner only aware via logs !!
23. Celery Beat schedule — auto-trigger weekly report every Monday !!
24. AI query router — submit question, return answer (schemas, services, router) — Owner only !!
25. Background AI query task — Celery Beat task that calls Groq, stores result — Owner only !!

## Storage

26. Set up AWS S3 bucket + IAM user with least-privilege keys !!
27. Site photo upload endpoint — upload to S3 via boto3, store metadata in RDS !!
28. Manually test via Postman, then create Pytest coverage once fully finished !!
29. Report download endpoint — generate signed S3 URL, return to client !!
30. Double check all indexing created in PostgreSQL for correctness and relevance !!

## AI / RAG Layer

31. Build RAG pipeline — retrieve relevant RDS records, chunk, embed, similarity search, assemble prompt, call LLM !!
32. AI query history — store all queries and answers per user in RDS !!
33. AI query history cleanup — Celery Beat task, delete queries older than 90 days !!
34. Seed 1,500+ records for core business data to test performance and support future dashboard charts !!
35. Seed a 2-year historical dataset (2024–2026) with realistic variance — typhoon delays, supplier shortages, budget overruns, attendance drops during incidents, phase slippages, material price spikes — messy enough to produce meaningful model signal rather than an easy or obvious pattern !!
36. ML analytics pipeline — train scikit-learn models on seeded historical data with realistic variance: budget overrun classifier, delay risk scorer, material demand forecaster — expose as owner-only endpoints, retrain via Celery Beat weekly !!
37. Test the entire AI/RAG layer manually via Postman !!

## Caching

38. Configure Redis cache layer — cache project lists, dashboard KPIs, summaries !!
39. TTL + cache invalidation — invalidate on every log submission, project update, status change !!

## Testing

40. Set up a smoke test database (sitesync_test) that cleans up after itself and stays connected to Alembic — every Pytest run starts from zero data and ends at zero data !!
41. Set up Pytest + pytest-asyncio — test DB, fixtures, async client !!
42. Set up conftest — conftest only holds @pytest_asyncio.fixture(scope="function", loop_scope="function"); test files only contain the Test class logic !!
43. Write tests — auth, role enforcement, projects CRUD, daily logs, attendance, materials, and all endpoints !!
44. Celery tasks, RAG output, S3 upload/download tests !!
45. Target full endpoint coverage !!
46. Update all services to match README requirements for Pytest, fully synced !!

## CI/CD

47. GitHub Actions — run full Pytest on every push, block broken builds from merging (pytest --tb=short -q) !!
48. Linting — Ruff for Python, configured in pyproject.toml, runs in GitHub Actions !!

## Docker

49. Dockerfile for FastAPI !!
50. docker-compose — FastAPI + Celery worker + Redis + local PostgreSQL, all in one command !!
51. Verify full local stack runs cleanly via docker-compose up !!

## AWS / Deployment (Free Tier)

52. Create middlewares !!
53. Provision AWS RDS PostgreSQL — run Alembic migrations against RDS !!
54. Check local and prod databases stay in sync, especially migrations !!
55. Provision AWS EC2 — deploy Docker containers, configure environment variables !!
56. Connect AWS EC2 and RDS PostgreSQL to each other, get the EC2 server running publicly !!
57. CD pipeline — add deploy job to ci.yml, auto-deploy to EC2 on merge to main !!
58. Create an IAM user with S3-only access (for boto3 file uploads) !!
59. Set up S3 !!
60. Create health check endpoints for every connection — health/db, /redis, /celery, /s3, etc. !!
61. Revisit steps 19, 26, and 43 to fix outstanding issues; all now updated !!
62. Create an IAM user with console access for team/human login — least privilege, no root sharing !!
63. Load test with Locust — simulate 500 concurrent users, identify bottlenecks !!
64. Add AWS ALB + a second EC2 instance !!
65. Update ci.yml so CD also deploys to the second EC2 instance for ALB, not only the first !!
66. Confirm ALB is fully working and tested, load balancing correctly separates requests !!
67. Validate the following three-part workflow: developers run docker-compose up to test the full stack locally, AWS EC2 runs the Docker containers in production, and CI/CD builds and ships the Docker image automatically on merge !!
68. Apply for AWS free credits where available (activities worth up to $100 in credits) !!
69. Redis/Celery running as Docker containers on EC2, confirmed working in prod via /health/redis and /health/celery — ElastiCache skipped, not needed at current scale !!
70. Review backend for possible security vulnerabilities from attackers, including AWS service exposure !!

## Frontend — Bun + Vite + React + TypeScript + TanStack + Zustand

71. Initialize Vite + React + TypeScript project with Bun — folder structure, Tailwind, Zod, React Query, Zustand installed !!
72. Configure tsconfig.app.json and other dev package configs !!
73. Configure vite.config.ts and .env for development vs. production !!
74. Set up React Query in main.tsx, Tailwind in index.css, and linting !!
75. Align all Zod types and validations to mirror backend Pydantic schemas — consistent validation across frontend, backend, and database !!
76. Stopped backend services on AWS to avoid cost while developing frontend — used local/dev environment in the meantime !!
77. Auth pages — register, login, JWT storage, protected routes, all working !!
78. Define src/ directory structure:
    - pages/
    - LoginPage.tsx, RegisterPage.tsx, HomePage.tsx (role dispatcher)
    - management/ — Owner + PM shared shell (Dashboard, Projects, DailyLogs, Reports, Analytics, AiAssistant)
    - worker/ — Worker minimal shell (Attendance, DailyLog)
    - _components/ — shared UI components (Sidebar, TopNav, Footer)
    - Routes: /login, /register, / (role-dispatched), /dashboard, /projects, /projects/:id, /projects/:id/logs, /projects/:id/logs/:date, /projects/:id/reports, /workers, /workers/:id, /ai, /settings !!
79. Auth flow — LoginPage (/login worker-only, /login/admin Owner+PM), HomePage role dispatcher, AuthContext (/me on load), Zustand auth store, useLogin/useLogout/useRegister hooks, ManageUsersPage with OwnerRegisterForm (role dropdown) and PmRegisterForm (worker-only), session-expired alert on 401 with an active token, /login/admin access denial for the wrong role !!
80. Update AWS billing budget — target under $1/day across all services, delete idle/unused resources !!
81. Applied Lovable-generated UI patterns to my own idea — sonner toast, etc.; updated axios.ts to use toast instead of alert !!
82. Shared UI shell — sidebar, navigation, role-gated menu items !!
83. Downloaded UI component boilerplates from Lovable, configured them for the project !!
84. Shared root layout — sidebar and top nav mounted once at App.tsx and never unmount across page navigation; in-page interactions (tabs, modals, drawers) stay SPA, and the URL only changes on context switches worth bookmarking !!
85. Built the login page and homepage with working, real data, including logout on the homepage !!
86. Updated homepage UI — sidebar, navbar, headers, and a light/dark mode toggle !!
87. Built the Owner default page with initial dummy/static data !!
88. Updated backend to match frontend changes, including KPIs for Owner and PM !!
89. Connected all endpoints end-to-end, no dummy data left in the Owner/Admin dashboard:
    - Owner dashboard — cross-project KPIs, project list, AI query panel, etc.
    - Charts for PM and Owner viewing
    - Table built with TanStack
    - View filtering for Owner vs. PM in the frontend
    - Year filtering
    - Dashboard fully finished for both Owner and PM viewing, with filtering
    - Removed all console logs after the dashboard was fully working and debugged
    - Ran linting
    - Used the useMobile hook for mobile responsiveness and support !!
90. Confirmed all files in ui/ are actually used and connected, ran linting !!
91. Removed ALB load balancing from AWS due to cost — three Elastic IPs running 24/7 was too expensive; after understanding the tradeoff, removed the second EC2 instance as well !!
92. Adopted React Query across the app for API calls and server-state caching, and Zustand for global client state — current user/role, sidebar, active project context !!
93. Created the ProjectsPage.tsx using TanStack Table:
    - Owner Projects page — full CRUD
    - PM/Manager Projects page — assign and unassign !!
94. Manage Users — needed by both Owner and PM to register and manage accounts; without it, real users can't be added to the system. Backend was already complete (routers/user.py, services/user.py); built out the Owner page first, then the PM page !!
95. Daily Logs — the core feature of the product; PM submits end-of-shift logs covering attendance, materials, equipment, and incidents. Backend was already complete; built out DailyLogsPage.tsx, the heart of SiteSync !!
96. Reports — depends on real Daily Logs data. Weekly PDF generation via Celery, backend already done; built out ReportsPage.tsx and tested the scheduled path via a manual Celery trigger (trigger_all_weekly_reports), confirmed source='scheduled' in both DB and frontend !!
97. Implemented pagination across backend and frontend for Daily Logs, Reports, and Manage Users:
    - Backend — added limit/offset to relevant list endpoints
    - Frontend — added pagination, sorting, and filtering controls using @tanstack/react-table !!
98. Daily Logs — backend pagination, Redis caching, and search query params; frontend pagination, React Query caching, and search UI !!
99. Reports — backend pagination, Redis caching, and page/page_size query params; frontend pagination, React Query caching, URL-sync (project, page), and a seeded/historical badge variant !!
100.  Manage Users — backend pagination, Redis caching (user-scoped keys), and search query params; frontend pagination, React Query caching, URL-sync (page, search), and server-side search !!
101.  Skipped pagination on the Projects page due to limited data volume — a dropdown filter is sufficient !!
102.  Owner ML Analytics — predictive insights for Owner only: budget overrun risk per project, workforce productivity trends, material consumption forecasting, project delay probability !!
103.  AI Assistant — Owner only, depends on real daily log data to query meaningfully; built out OwnerAiAssistantPage.tsx with pagination for scroll history and end-to-end caching, and fixed backend query issues !!
104.  Site Photos — PM and Owner only, upload and view photos attached to daily logs:
      - Frontend: api/sitePhoto.ts, services/sitePhoto.ts, LogDetailSheet.tsx photo section (view + upload)
      - Added a modal for better upload/viewing UX
      - Added caching from frontend to backend !!
105.  Refactored the Reports page from a daily to a weekly cadence — large refactor with accompanying bug fixes; improved security by removing direct frontend download links in favor of a proxy using blob !!
106.  Settings page for PM and Owner:
      - Profile information
      - Security / change password
      - Danger zone / deactivate account
      - Manage user modification for password resets !!
107.  Ran linting across the frontend and fixed all issues:
      - 72 problems found (63 errors, 9 warnings), traced to Radix UI boilerplate files
      - Added eslint-disable across affected files — safe to disable, since these were UI boilerplate exports or false-positive lint calls on valid patterns
      - Fixed all but 4 remaining warnings !!
108.  Made KPIs clickable on the dashboard — wired Total Active Projects and Budget vs. Actual Spend to the Projects page, and Logs Submitted to the Daily Logs page, for both Owner and Manager views !!
109.  Daily Logs — built PM-facing CRUD inside the Daily Log detail view (LogDetailSheet expandable sections, matching the existing Site Photos pattern):
      - Materials — log name, quantity, unit, unit cost; edit existing entries
      - Attendance — submit worker hours per shift (worker selected from the project's assigned workers)
      - Equipment — log name, quantity, condition; edit existing entries
      - Incidents — log description, severity, status; edit existing entries !!
110.  Daily Logs backend — added Redis caching to materials, attendance, equipment, and incidents !!
111.  Implemented linting and Prettier in the frontend and ran them !!
112.  Cleaned up and polished the Owner/Manager experience, tested manually, including Celery side tasks (Site Photos automation, scheduled Beat jobs) and ML analytics retraining !!
113.  Built out the full Worker page, once Manager and Owner pages were complete:
      - Closed remaining backend gaps for worker-facing frontend needs
      - Implemented frontend pages and UX for workers
      - Added test coverage for the worker flow !!
114.  Cleaned up and polished the Worker page — confirmed all core site-related actions work correctly for the worker role !!
115.  Designed the login page CSS and index.html !!
116.  Removed unused UI files, verified via grep !!
117.  Set up CI/CD for the frontend repo (revisiting the same approach as step 47):
      - Added a pre-commit hook
      - Added .github/ci.yml and a PR template
      - Configured GitHub Actions and repository rulesets !!
118.  Created a Demo folder with demo modals letting a visitor choose to view as Worker, PM, or Owner (view-only, no editing):
      - Backend — secured demo account access
      - Frontend — built the demo folder and login-only files !!
119.  Deployed to Vercel !!
120.  Connected frontend and backend AWS services and synced them:
      - Reactivated EC2 and EIP
      - Set up SSH, Docker, and CD
      - Updated .env, CORS, and keys
      - Enabled HTTPS !!
121.  Seeded realistic data for better demo viewing across Site Worker, PM (5+), and a single Owner, all interconnected, spanning a historical window through the current month (e.g. July–December) — since ML/RAG should only reference past and current data, never future data, this also future-proofs the demo login experience !!

## Finish Line — Improvements, Optimization, Performance, Security, Benchmarks

122. Closed backend gaps discovered during frontend integration — added missing endpoints, fixed mismatched schemas, added new features the frontend revealed were needed, added indexing driven by frontend requirements, overall polish !!
123. Ran pytest --cov=app --cov-report=term-missing — raised total coverage from 58% to 92%, and to 100% on core business logic !!
124. Updated Docker setup to automate the full project setup for AWS EC2 and any future machine !!
125. Frontend security — added a Content Security Policy (CSP) to mitigate XSS and injection risk !!
126. Verified the app runs correctly on a different machine, confirming Docker/local setup portability !!
127. Migrated Celery from local Redis to AWS SQS !!
128. Reverse proxy + free SSL cert — already handled via Caddy (automatic HTTPS with a Let's Encrypt certificate, reverse proxying :8000 -> 443) !!
129. Migrate deployment from manual SSH + Docker on EC2 to AWS ECS, so containers are managed and orchestrated automatically instead of SSH-ing in to run docker-compose by hand !!
130. Implement end-to-end notifications, if time allows %%
