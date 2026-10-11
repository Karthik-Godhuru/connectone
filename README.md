# ConnectOne

> An AI-powered collaborative career platform connecting builders, hackathon teams, and creators through explainable matching, skill intelligence, and actionable progression roadmaps.

Built for hackathons and ambitious builders across technical and creative disciplines.

---

## Overview

ConnectOne bridges the gap between ambitious builders, high-impact projects, and long-term career progression. Rather than matching candidates purely on identical skill overlap, ConnectOne's dual-engine architecture identifies:
1. **Shared Foundational Interests** (common passions, shared technical or domain interests)
2. **Complementary Skill Synergy** (e.g. AI/ML engineers paired with full-stack developers, founders paired with systems architects, musicians paired with creative directors)

Beyond matching, ConnectOne transforms raw onboarding profiles into structured intelligence models with Gemini 3.8 Flash, delivers sequential career progression milestones, and recommends tailored opportunities.

---

## Core Features

- **Multi-Disciplinary Onboarding**: Captures career domains (AI/ML, Software Development, Cybersecurity, Data Science, Research, Entrepreneurship, Design, Music, Dance, Content Creation, and Marketing), skills, interests, portfolio builds, and 3-tiered aspirational goals.
- **AI Profile Intelligence**: Server-side synthesis via Google Gemini 3.8 Flash returning strictly validated structured models (strengths, skill gaps, learning recommendations, and collaboration preferences).
- **Deterministic Teammate Matchmaking**: 6-factor weighted compatibility scoring (0–100%) featuring cross-domain skill synergy lookups, mutual exchange metrics, and explainable human-readable match rationales.
- **Connection Workflow**: Full peer networking lifecycle (Send Request, View Received, Accept, Reject, View Connected Partners) with duplicate invite prevention.
- **AI Career Roadmaps**: Dynamic sequential career milestones with estimated durations, priority tags, immediate next actions, and persistent checklist tracking in PostgreSQL.
- **Curated Opportunities**: Prototype discovery architecture scoring hackathons, internships, fellowships, and research grants calibrated to stage and target skills.
- **Central Product Dashboard**: Information-dense, executive overview with welcome metrics, profile progress tracking, tactical next action banners, and collaborator previews.
- **Dedicated Profile Management**: Safe view and edit interface for personal info, aspirational goals, skills, interests, and portfolio works.

---

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, SSR Cookie Sessions)
- **AI Engine**: [Google Gemini 3.8 Flash](https://ai.google.dev/) via `@google/genai`
- **Deployment**: [Vercel](https://vercel.com/)

---

## Relational Database Architecture

ConnectOne uses 9 pre-provisioned relational PostgreSQL tables in Supabase:

| Table | Purpose |
| :--- | :--- |
| `profiles` | User identity, bio, career domain, education, links, and aspirational goals |
| `skills` | Master catalog of technical and creative craft skills |
| `user_skills` | Junction table associating users with skills and verified proficiency levels |
| `interests` | Master taxonomy of domain verticals and creative tracks |
| `user_interests` | Junction table mapping user passion areas |
| `projects` | Portfolio items, hackathon repositories, demo links, and tags |
| `connections` | Peer collaboration invitations and states (`pending`, `accepted`, `declined`) |
| `matches` | Stored compatibility scores and explainable matchmaking rationales |
| `career_roadmaps` | Sequential progression milestones, active trajectory, and completion states |

---

## Getting Started Locally

### Prerequisites

- Node.js >= 18.17.0 (Node.js 20 or 24 recommended)
- npm >= 9.0.0
- A Supabase project with database tables provisioned
- A Google Gemini API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Karthik-Godhuru/connectone.git
   cd connectone
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run the production build**:
   ```bash
   npm run build
   npm run start
   ```

---

## Required Environment Variables for Vercel Deployment

When deploying to Vercel, configure the following environment variables in the project settings:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Your Supabase public anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | Supabase administrative key (never exposed client-side) |
| `GEMINI_API_KEY` | Server Only | Google Gemini API key for server AI routes |

> **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` to client-side code. They do not have the `NEXT_PUBLIC_` prefix and are strictly accessed inside Server Components, Route Handlers, and Server Actions.

---

## Application Route Map

- `/` — Product landing page and architecture specifications
- `/login` — Secure email/password authentication
- `/signup` — New builder account registration
- `/onboarding` — Multi-step profile intake wizard
- `/dashboard` — Central user dashboard and mission control
- `/discover` — Teammate matching directory with analytical compatibility scores
- `/roadmap` — Interactive AI career roadmap with persistent milestone tracking
- `/opportunities` — Curated program discovery across 10 categories
- `/connections` — Collaborator network and connection request manager
- `/profile` — User profile view and interactive editor
- `/intelligence` — Deep AI Profile Intelligence report
- `/status` — System health and database connectivity diagnostics
- `/api/health` — JSON health check endpoint

---

## License

This project is licensed under the MIT License.
