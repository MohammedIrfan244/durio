<!-- markdownlint-disable -->

# Durio - The Ultimate Life OS

![Durio Banner](public/favicons/android-chrome-512x512.png)

**Durio** is a comprehensive, cross-platform "Life OS" designed to unify your daily productivity, health tracking, and digital organization into one seamless, aesthetic experience. Built with a modern, feature-first architecture, Durio is available both as a highly responsive web application and a native Android app.

**Live Web App:** [https://durio.vercel.app/](https://durio.vercel.app/)
**GitHub Repository:** [https://github.com/MohammedIrfan244/to-do-app](https://github.com/MohammedIrfan244/to-do-app)

---

## ✨ Core Features

Durio isn't just a to-do list; it's an ecosystem of modules that you can enable or disable to perfectly fit your lifestyle:

- **📋 Advanced To-Do & Task Management:** Organize your life with drag-and-drop kanban boards, priority tagging, and seamless deadline tracking.
- **🤖 Duria AI Assistant:** Talk with "Duria," your personal built-in AI companion ready to assist with ideas, tasks, and scheduling.
- **🧮 Comprehensive Calculator Suite:** Includes Essential, Scientific, Graphing, Statistics, Matrix, and Complex Math calculators.
- **📅 Calendar & Scheduling:** Keep track of your adventures, meetings, and chilling time.
- **📓 Notes & Journaling:** A safe, private space for your brainstorms, reflections, and daily journaling.
- **💪 Health & Wellness Tracking:** Dedicated modules for Workout tracking, Sleep optimization, and Menstruation/Cycle tracking.
- **📚 Reading List & Photo Album:** Keep track of your favorite books and store your most cherished memories.
- **📱 Native Android Experience:** Fully packaged Android app using Capacitor, complete with native Google Sign-In and Android Push Notifications via Firebase.
- **🎨 Dynamic Themes:** Choose from stunning curated aesthetics like "Pookie Glow", "Midnight Goth", "Earthy Calm", or standard Light/Dark modes.

---

## 🛠️ Tech Stack & Key Libraries

Durio is built on the absolute cutting edge of the React ecosystem:

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion (for physics-based animations)
- **Database**: MongoDB (via Prisma ORM)
- **Authentication**: NextAuth.js (Web) + `@capawesome/capacitor-google-sign-in` (Native Android)
- **Mobile Packaging**: Capacitor JS
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Forms & Validation**: React Hook Form + Zod
- **Drag & Drop**: `@dnd-kit`

---

## 🚀 Getting Started (Local Development)

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/MohammedIrfan244/to-do-app.git
cd to-do-app
npm install
```

Set up your `.env` file (refer to `.env.example` if available) with your MongoDB URI, Google Client IDs, and Firebase credentials.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📱 Building for Android

Durio is fully configured to compile into a native Android application using Capacitor.

1. Build the Next.js production web assets:
   ```bash
   npm run build
   ```
2. Sync the web assets to the Android project:
   ```bash
   npx cap sync android
   ```
3. Open Android Studio to build and run the APK:
   ```bash
   npx cap open android
   ```

*Note: For Native Google Sign-In to work locally, ensure your computer's `debug.keystore` SHA-1 fingerprint is added to your Firebase project.*

---

## 📂 Architecture & Project Structure

The project follows a **Feature-Based Architecture** within the Next.js App Router to maximize scalability.

```text
src/
├── app/                  # Next.js App Router
│   ├── (main)/           # Authenticated App Route Group (Inherits Sidebar Layout)
│   │   ├── todo/         # To-Do Module
│   │   ├── calculator/   # Calculator Module
│   │   └── ...
│   ├── api/              # API Routes (NextAuth, Webhooks, AI)
│   ├── layout.tsx        # Root Layout
│   └── not-found.tsx     # Custom 404
├── components/           # React Components
│   ├── ui/               # Shadcn UI primitives
│   ├── shared/           # Cross-feature components
│   ├── pages/            # Feature-isolated components
│   └── layout/           # App layouts (Sidebar, Headers, Radial Menus)
├── hooks/                # Custom React Hooks (e.g., useMobile, useCapacitor)
├── lib/                  # Utilities & Configurations
│   ├── utils/            # Client-safe helpers (cn, date-formatting)
│   └── server/           # Server-side ONLY logic (Firebase Admin, Prisma)
├── server/               # Next.js Server Actions (Database mutations)
└── schema/               # Zod validation schemas
```

### Server Actions
We strictly rely on **Next.js Server Actions** (located in `src/server/`) for database mutations rather than building traditional API routes. This allows for end-to-end type safety and massively reduces boilerplate.

---

## 🤝 Contributing

This project is maintained by **Mohammed Irfan**. 
If you find a bug or have a feature request, please open an issue!
