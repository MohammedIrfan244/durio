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
- **Web PDF Search Engine**: A built-in pipeline where users can search for a book by name, and the system scours the internet to find and list direct PDF links, allowing users to instantly download and add the book to their library.
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

## ⛓️ Relational Architecture & Connection Matrix

To maintain the "Single System" vision, Durio uses a **Polymorphic Linking Engine**. Instead of isolated apps, every module is built with the ability to "Attach," "Reference," or "Influence" data from other modules.

### The Master Connection Matrix

| Source Module | Target Module | Connection Type | Functional Purpose |
| :--- | :--- | :--- | :--- |
| **Home** | ALL | Aggregation | Central dashboard displaying real-time status and "Daily Digest" from every active module. |
| **DURIA (AI)** | ALL | Master Control | Global context access; executes actions (Create/Update/Delete) across all modules via natural language. |
| **Calendar** | To-Do | Sync | Tasks with due dates automatically appear on the calendar grid. Dragging moves the due date. |
| **Calendar** | Journal | Context | Link a specific day's journal entry to a calendar event for easy memory retrieval. |
| **Calendar** | Photos | Visuals | View photos taken on the date of a specific calendar event directly within the calendar view. |
| **To-Do** | Notes | Linking | Attach a "Research Note," "Draft," or "Resource" to a specific actionable task. |
| **To-Do** | Projects | Hierarchy | Large Projects are broken into actionable To-Dos that funnel into the user's main task list. |
| **Notes** | Projects | Documentation | Store all project-related documentation, brainstorming, and technical specs as linked notes. |
| **Notes** | Reading List | Synthesis | Automatically store book highlights, summaries, and reflections as linked searchable Notes. |
| **Journal** | Photos | Media | Directly embed Album photos into diary entries to create a rich, media-heavy memory vault. |
| **Journal** | Health | Correlation | Correlate daily mood/energy (logged in Journal) with Sleep and Cycle tracking data for insights. |
| **Workouts** | Sleep | Optimization | Suggest daily workout intensity (e.g., Rest vs. HIIT) based on last night's sleep quality scores. |
| **Workouts** | Cycle | Support | Provide cycle-specific diet and exercise suggestions with a friendly, cheering vibe. |
| **Projects** | Photos | Progress | Link photos to project milestones to track visual progress (perfect for DIY, Art, or Coding). |
| **Quick Calc** | ALL | Utility | Floating overlay available globally for context-specific math (Macros, Budgeting, Dimensions). |

### Technical Implementation Strategy

1.  **Unified `ResourceLink` Model**: A central table in Prisma that stores `fromId`, `fromType`, `toId`, and `toType`. This avoids adding hundreds of optional foreign keys to every individual model, keeping the schema clean and infinitely scalable.
2.  **Global Command Center**: The search bar in the header is "Global"—it searches across Events, Tasks, and Notes simultaneously to surface all related context in one place.
3.  **Cross-Module Sidebars**: Modules feature "Smart Sidebars" that surface relevant data from other areas. For example, the **Journal** sidebar automatically shows **Photos** taken on the current day.
4.  **The "DURIA" Bridge**: As the only module with "Full Context" (as stated in its core features), DURIA acts as the manual override for all links—allowing users to say "Link this note to my gym session tomorrow" to create an instant connection.
---

## ⏸️ On Hold / Removed

- **Focus Time (`/focus`)**: Initially planned as a gamified focus module. Left on hold for now.
- **Resource Stash (`/resources`)**: Removed from the project scope to maintain focus on the core personal management experience.
