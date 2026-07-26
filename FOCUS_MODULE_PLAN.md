# Focus Time Module: The Gamified 24-Hour Routine Engine

This is the permanent save state and blueprint for the `/focus` module, safely stored in your project root so it never gets lost between coding sessions.

## ✅ Phase 1: Completed
- **Database Schema**: Created `RoutineBlock` and `BlockLog` models in `prisma/schema.prisma`.
- **User Settings**: Added `endOfDayReviewTime` (default 22:00) for the customizable review modal.
- **Module Registration**: Enabled `/focus` globally in `src/config/modules.ts`.
- **DURIA Integration**: Taught DURIA (`src/app/api/chat/route.ts`) how to parse requests for "focus blocks" and propose creating/updating/deleting them.
- **Database Sync**: Ran `npx prisma db push` and `npx prisma generate` to lock the schema in.

---

## 🚀 Phase 2: Next Steps (The Core UI & Backend Actions)
*When we resume, we will build these components:*

1. **Backend Server Actions (`src/server/actions/focus-actions.ts`)**
   - We need to create the actual server actions: `createFocusBlock`, `updateFocusBlock`, `deleteFocusBlock`, and `getFocusBlocks`.
   - Update `proposal-card.tsx` to execute these actions when DURIA proposes them.

2. **The Timetable (`src/app/focus/page.tsx`)**
   - Build a stunning 24-hour vertical timeline/grid.
   - UI to create and drag blocks, visually showing **Energy Levels** through color-coding (e.g., Red for High Energy, Blue for Recovery).
   - Add simple toggles for the `daysOfWeek` (e.g., clicking "M", "W", "F" to set the repeating weekly schedule).

---

## 🔮 Phase 3: Dashboard Widget & Ecosystem Sync
*The final polish to connect Focus with the rest of Durio.*

1. **Dashboard Gamified Tracker**
   - A widget on the Home page (`/`) that checks the current time. If a block is active, it shows the transition ritual, title, and a 3-button survey when it ends (to earn Flow Points).

2. **Focus ↔ To-Do Direct Sync**
   - When a `RoutineBlock` actively starts, the system automatically generates an **uneditable** `Todo` item in the user's Pending list. We will map fields from Focus -> Todo (Title, Description, Priority, Time). 

3. **The End-of-Day Reviewer**
   - A modal that pops up on the Dashboard automatically at the user's customized `endOfDayReviewTime` (e.g., 10 PM), summarizing their Flow Points for the day.

4. **Focus ↔ Note Linkage**
   - Allow attaching a specific Note ID to a Focus block so you can instantly open your "Workspace Note" when the block begins.
