# Durio Project - Modules Overview

This document serves as the master blueprint for the Durio system—a unified personal manager app. Rather than feeling like a collection of disjointed tools, Durio is designed to be a single, cohesive, premium environment.

## 🟢 Implemented Modules

### Home (`/`)
- **Core**: The primary dashboard and welcoming entry point.
- **Vibe**: A comfy starting point with good vibes.

### My To-Dos (`/todo`)
- **Core**: Comprehensive task management.
- **Vibe**: Designed to give you that "sweet, sweet done feeling."

### My Notes (`/notes`)
- **Core**: Quick and robust note-taking for capturing random brainstorms and structured thoughts.

### Quick Calc (`/calculator`)
- **Core**: A complex, highly-functional calculation suite.
- **Features**: Includes modules for Essential Math, Scientific, Graphing, Statistics, Matrix & Linear Algebra, and Complex Math.

---

## 🟡 To Be Implemented / Work-in-Progress

### 1. My Calendar (`/calendar`)
- **Core Functionality**: A comprehensive main calendar view.
- **Event Categories**: Supports different types of events such as single event reminders, meetings, anniversaries, etc.
- **Weather Integration**: A dedicated weather section with cool animations, pulling data from an external API.
- **Search & Discovery**: Robust search functionality for all created and connected events.
- **System Cohesion**: Practical features that link calendar events with other Durio modules.

### 2. Reading List (`/books`)
- **Core Functionality**: A complete organization system dedicated to avid readers.
- **Organization & Sorting**: Advanced arrangement options with multiple sorting criteria (genre, author, date added, reading status).
- **Digital Library**: Full support for digital books (e.g., storing/reading PDFs) and managing external book links.
- **Discovery Pipeline**: A built-in online book search pipeline, allowing users to find and add books directly within the app without leaving the site.
- **Additional Features**: Practical tools like reading progress tracking, favorite quotes, and reading goals.

### 3. My Journal (`/journal`)
- **Core Functionality**: A highly personal diary and reflection space.
- **Rich Media**: Support for comprehensive file uploading—images, audio recordings, and videos.
- **Storage Management**: A total storage use cap enforced per user across the entire project.
- **Vibe**: Insanely personal, intimate feeling. Keeping things simple, safe, and intuitive.

### 4. Photo Album (`/album`)
- **Core Functionality**: Digital photo management and memory keeping.
- **Organization**: Multiple fields for sorting, filtering, and searching photos.
- **The "Uncommon Wish" Feature (Contextual Audio Memories)**: A feature allowing users to record and attach short audio voice notes to specific photos—capturing the exact story, background noise, or feeling behind the moment, acting as an interactive time capsule. Alternatively, an AI-powered Vibe Search that filters photos based on the emotions/vibes they convey.

### 5. Workouts (`/workout`)
- **Core Functionality**: A unified fitness, diet, and health tracker.
- **Custom Plans**: Ability for the user to create custom workout routines and diet plans.
- **Tracking**: Comprehensive logging for daily calories, individual workouts, and overall fitness progress.
- **Body Metrics**: Tracking for body measurements, including BMI, weight, and other crucial health indicators.

### 6. Sleep Tracker (`/sleep`)
- **Core Functionality**: Logging and optimizing sleep patterns.
- **Vibe**: Kept very simple and easy to use. Focuses on essential tracking (hours slept, sleep quality) for maximum chill without unnecessary complexity.

### 7. Cycle Tracker (`/menstruation`)
- **Core Functionality**: Menstrual cycle tracking.
- **Vibe**: Extremely user-friendly, supportive, friendly, and cheering interface. 

### 8. My Projects (`/projects`)
- **Core Functionality**: A portfolio and structured project management section.
- **Features**: A place to beautifully arrange and document personal or professional projects.
- **Integrations**: Allows attaching full documentations, live examples, and external URLs.

### 9. DURIA (AI Agent) (`/duria`)
- **Core Functionality**: The central, unified AI companion for the Durio ecosystem.
- **Context Awareness**: DURIA has full knowledge of the project's structure, where everything is placed, and exactly how each feature works.
- **Data Interaction**: DURIA can securely view the user's data and hold context-aware conversations based on it.
- **Action Execution**: Instead of manually navigating pages, users can instruct DURIA to create, update, or delete items (e.g., "Schedule a meeting for tomorrow at 5 PM").
- **Safety Protocol**: Before executing any significant action, DURIA will present a clear prompt explaining what it is about to do, requiring a simple Yes/Cancel confirmation from the user.

---

## 🔗 The Relational Ecosystem (Cross-Module Integration)

To ensure Durio feels like a **single unified system** rather than isolated apps, all modules are deeply interconnected. Data flows seamlessly between them to provide a holistic personal management experience.

### 1. Data Aggregation & The Home Module
- **Daily Digest**: The Home screen pulls data from **Calendar** (today's events), **To-Dos** (urgent tasks), **Workouts** (daily fitness goals), and **Sleep** (last night's recovery) to give you a single, unified snapshot of your day.

### 2. Task & Time Synchronization
- **Calendar & To-Dos**: Tasks with deadlines automatically appear on your Calendar. Conversely, you can drag Calendar events to auto-generate preparation To-Dos (e.g., creating a "Prep for Meeting" task from a Calendar event).
- **Projects & To-Dos**: Large projects in **My Projects** break down into actionable items that funnel directly into your main **To-Do** list.

### 3. Holistic Health & Wellness
- **Workouts, Sleep & Cycle Tracker**: These three modules share a unified "Health Profile." For example, poor sleep data from the **Sleep Tracker** or specific phases from the **Cycle Tracker** can automatically suggest lighter routines in the **Workouts** module. 
- **Journal & Health**: Health metrics (like mood and energy levels logged in the Journal) are correlated with Sleep and Cycle tracking.

### 4. Memory & Reflection 
- **Journal & Photo Album**: When writing a **Journal** entry, you can easily embed images directly from the **Photo Album**. Viewing a photo from a specific date can automatically pull up the Journal entry written on that same day to provide full context.

### 5. Knowledge Management
- **Reading List & Notes**: Highlights, summaries, and quotes captured in your **Reading List** can be automatically synced or linked to **My Notes** for later reference.
- **Notes & Projects**: Research and brainstorming in **My Notes** can be explicitly attached to specific projects in the **My Projects** module.

### 6. Universal Utilities
- **Quick Calc**: The calculation suite acts as a universal tool. You can pull it up while in **Workouts** (to calculate BMI or macro-nutrients) or in **My Projects** (for budgeting or dimension planning).

### 7. The Master Connector: DURIA (AI Agent)
- **Cross-Module Intelligence**: DURIA is the ultimate bridge. It can analyze your **Calendar** and **Sleep** data to suggest moving a **Workout** to a later time. It can read your **To-Dos** and summarize them in a **Note**, or fetch a specific memory from your **Photo Album** and draft a **Journal** entry. DURIA treats the entire app as one interconnected database.

---

## ⏸️ On Hold / Removed

- **Focus Time (`/focus`)**: Initially planned as a gamified focus module. Left on hold for now.
- **Resource Stash (`/resources`)**: Removed from the project scope to maintain focus on the core personal management experience.
