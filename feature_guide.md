# Durio Feature Guide

This document acts as the comprehensive manual for the entire Durio application. It maps out what, where, and how each feature in every module works. It serves as reference material for both developers and the DURIA AI Assistant.

## 1. Layout Elements
These elements are omnipresent and frame the application.

### Main Header
Located at the top of the viewport.
- **Sidebar Collapser (Left):** A button that toggles the visibility/expansion of the main sidebar.
- **Page Title (Center-Left):** Dynamically displays the name of the active module.
- **Clock & Greeting (Center):** A real-time clock paired with a dynamic greeting (e.g., "Good Morning, User").
- **Server Background Flagger (Right):** A manual sync button used to trigger a global refresh/update of all data.
- **Theme Selector (Right):** A dropdown to toggle between visual themes (Light, Dark, System, Pookie, Natural, Gothic, etc.).
- **Profile Dropdown (Far Right):** Contains a mini-profile overview, a shortcut to the Settings module, and the Logout button.

### Sidebar
Located on the left side of the viewport.
- **Navigation Menu:** Dynamically maps all active modules from the `APP_REGISTRY`. Can be expanded or collapsed.
- **Weather Widget:** Anchored at the bottom, displaying real-time local weather data.

---

## 2. Core Modules

### To-Do (Tasks)
A robust task management system.
- **Status Tracking:** Tasks can be flagged as Plan, Pending, Done, Cancelled, Overdue, or Archived.
- **Priorities:** Tasks can be assigned priority levels to sort urgency.
- **Checklists:** Complex tasks can be broken down into sub-task checklists.
- **Recurring Schedules:** Tasks can be set to repeat automatically (Daily, Weekly, Monthly, Yearly, Custom intervals).
- **Resource Linking:** Tasks can be explicitly linked to Notes or Calendar Events via the Resource Linker.

### Notes
A rich-text document editor for capturing ideas.
- **Rich Formatting:** Supports standard text formatting, headers, lists, etc.
- **Organization:** Notes can be titled and categorized using custom tags.
- **Resource Linking:** Notes can be linked directly to Tasks or Calendar Events for contextual reference.

### Calendar
A unified chronological view of user data.
- **Standard Events:** Traditional date/time-based scheduling.
- **Special Occasions (Birthdays & Anniversaries):** Specialized events that calculate age or occurrence count based on the "original year" provided in the start date.
- **Resource Linking:** Events can be tied to Notes and Tasks (e.g., attaching meeting notes to a calendar event).

### Calculator
A dedicated utility module for mathematics.
- **Sub-modules:** Contains specific interfaces for:
  - Essential Toolkit (Basic operations)
  - Scientific Calculator
  - Graphing Calculator
  - Statistics
  - Matrix & Linear Algebra
  - Complex Math

### Settings
The global user preference management center.
- **Account Details:** Profile management.
- **Module Toggles:** UI to allow the user to manually enable or disable specific modules (e.g., hiding the Journal if they don't use it).
- **Fancy Mode:** A master performance toggle. Turning this *off* switches to the system theme, removes heavy background images (like in the header), removes theme-based decorations in the sidebar (like Pookie flowers), and pauses all heavy animations across the app to maximize performance.
- **DURIA AI Settings:** Preferences relating to the AI assistant's behavior.
