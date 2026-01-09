<!-- markdownlint-disable -->



# To-Do App Project Documentation

This is a **Next.js 16** project built with **React 19**, **Prisma**, **Tailwind CSS**, and **Shadcn UI**. It features a modular, feature-first architecture designed for scalability and maintainability.

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Project Structure

The project follows a **Feature-Based Architecture** within the Next.js App Router.

```
src/
├── app/                  # App Router
│   ├── (main)/           # Route Group for Authenticated App (Sidebar/Header)
│   │   ├── todo/         # Feature routes inherit MainLayout
│   │   └── ...
│   ├── layout.tsx        # Root Layout (Providers only)
│   └── not-found.tsx     # 404 Page (No Sidebar)
├── components/           # React Components: UI, Shared, and Feature-specific
├── hooks/                # Custom React Hooks
├── lib/                  # Utilities, Helper Functions, and Configuration
│   ├── server/           # Server-side specific utilities
│   ├── utils/            # General client/server utilities
│   └── ...               # Specific logic (brand, nav, prisma)
├── schema/               # Zod Schemas for validation
├── server/               # Server Actions and internal server logic
├── types/                # TypeScript type definitions
└── asset/                # Static assets (JSONs, etc.)
```

---

## 🏗️ Folder Breakdown & Usage Guide


### 1. `src/app` (Routing)
Routes are defined here. Each folder represents a route segment. We use a **Feature-First** approach:

#### `(main)` Route Group
We use a **Route Group** `(main)` to wrap the authenticated application.
-   **Purpose**: To apply the Sidebar/Header layout (`AppLayout`) *only* to main features (`todo`, `notes`, etc.).
-   **Benefit**: This allows pages like **404 (`not-found.tsx`)** or **Auth** pages to exist at the root level without inheriting the sidebar.

#### Feature Folders
Inside `src/app/(main)/`, you will find:
-   `books`
-   `notes`
-   `todo`
-   `calendar`
-   `workout`
-   ... containing their own `page.tsx`.



**API Routes**: 
`api/`
 handles backend API endpoints (likely for Auth or webhooks).



### 2. `src/components` (UI & Logic)

We strictly separate components by their scope:

-   **`ui/`**: **Shadcn UI** primitives (buttons, dialogs, inputs). These are reusable, dumb components.
-   

-   **`shared/`**: Components used across multiple features but not generic enough to be in `ui`.
-   

-   **`pages/`**: Feature-specific components.
-   

    -   *Example*: `src/components/pages/todo` contains components *only* used in the To-Do feature.
    -   *Example*: `src/components/pages/note` contains components *only* used in Notes.
-   

-   **`skeleton/`**: Loading state skeletons.
-   

-   **`layout/`**: Global layout components (Sidebars, Headers).



### 3. `src/hooks` (Custom Hooks)



Reusable logic hooks:
-   **`useMobile`**: Detects if the current viewport is mobile-sized.
-   **`useDebounce`**: Delays the execution of a function (useful for search/input).
-   **`useThemeImage`**: Dynamically returns a background image URL based on the current theme and active module (parsed from URL).




### 4. `src/lib` (Utilities & Helpers)
This folder contains the core logic that doesn't render UI.


#### `lib/utils` (General Helpers)

-   **`index.ts` (`cn`)**: the standard ClassName merger (clsx + tailwind-merge). **Use this for conditional classes.**
-   **`date-formatter.ts`**: Helper to format dates consistently.
-   **`logger.ts`**: Internal logging utility.
-   **`mailer.ts`**: Nodemailer setup for sending emails.
-   **`otp-generator.ts`**: Generates One-Time Passwords.
-   **`today.ts`**: Utilities for getting the current date/time with timezone awareness.
-   **`with-client-action.ts`**: Higher-order function/helper for client-safe actions.
-   **`name-formatter.ts`**: Standardizes user name display.


#### `lib/server` (Server-Side Only)

These MUST only be imported in Server Components or Server Actions.
-   **`get-user.ts`**: Retrieves the currently authenticated user session serverside.
-   **`date-utils.ts`**: Complex date manipulation logic (backend context).
-   **`error-wrapper.ts`**: Wraps server actions to handle errors gracefully.
-   **`generate-insight.ts`**: Logic for generating user insights/stats.



#### Other Lib Files

-   **`prisma.ts`**: The singleton instance of Prisma Client to prevent connection exhaustion during development.
-   **`nav.tsx`**: Navigation configuration (links, icons).
-   **`brand.ts`**: Branding constants (app name, colors).




### 5. `src/server` (Server Actions)

This project uses **Next.js Server Actions** for data mutations, located in `src/server/actions`.

-   **`to-do-action.ts`**: CRUD operations for To-Dos.
-   **`note-action.ts`**: CRUD for Notes.
-   **`user-action.ts`**: User profile updates.
-   **`auth-intent-action.ts`**: Handles authentication intents.
-   **`stats/`**: Logic for calculating dashboard statistics.




### 6. `src/schema` (Validation)

Zod schemas used for form validation and API request parsing. Always validate user input against these schemas before processing in Server Actions.

---

## 🛠️ Tech Stack & Key Libraries

-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + Tailwind Merge
-   **UI Components**: Radix UI (via Shadcn)
-   **Database**: PostgreSQL (via Prisma ORM)
-   **State/Data**: Server Actions (Mutations) + React Server Components (Fetching)
-   **Icons**: Lucide React
-   **Forms**: React Hook Form + Zod
-   **Date Handling**: date-fns + moment
-   **Drag & Drop**: @dnd-kit



## 📝 Developer Notes
1.  **Adding a new feature**:
    -   Create a route in `src/app/[feature-name]`.
    -   Create a folder in `src/components/pages/[feature-name]` for its components.
    -   Define database models in `prisma/schema.prisma`.
    -   Create Server Actions in `src/server/actions`.
2.  **Styling**: Always use the `cn()` utility from `src/lib/utils` when merging Tailwind classes.
3.  **Database**: Access the database *only* via `src/lib/prisma.ts` singleton.
