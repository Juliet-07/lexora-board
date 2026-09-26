# Lexora Board Portal (frontend-first)

Vite + React + TypeScript + Tailwind + shadcn/ui, same tokens, fonts and components as `lexora-tenant`.
All data is dummy (`src/data/boardMockData.ts`); auth is simulated (`src/contexts/AuthContext.tsx`).

    npm install
    npm run dev   # http://localhost:8081

Demo login: any valid email + password of 4+ chars ("Fill demo credentials" on the login page).

Built: Login, portal shell (sidebar + topbar), Dashboard. Other nav items route to a placeholder.
