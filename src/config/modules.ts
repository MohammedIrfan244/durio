export const APP_REGISTRY = {
  GLOBAL: {
    // A future-proof flag for disabling heavy animations and background images
    fancyMode: { enabled: true, description: "Toggles heavy animations and themes" },
  },
  LAYOUT: {
    HEADER:  { enabled: true, aiAccess: false, description: "Main top navigation bar" },
    SIDEBAR: { enabled: true, aiAccess: false, description: "Main left-side navigation" },
  },
  MODULES: {
    HOME:         { enabled: true,  systemDisabled: false, aiAccess: false, path: "/" },
    TODO:         { enabled: true,  systemDisabled: false, aiAccess: true,  path: "/todo" },
    NOTES:        { enabled: true,  systemDisabled: false, aiAccess: true,  path: "/notes" },
    CALENDAR:     { enabled: true,  systemDisabled: false, aiAccess: true,  path: "/calendar" },
    BOOKS:        { enabled: false, systemDisabled: true,  aiAccess: false, path: "/books" },
    JOURNAL:      { enabled: false, systemDisabled: true,  aiAccess: false, path: "/journal" },
    ALBUM:        { enabled: false, systemDisabled: true,  aiAccess: false, path: "/album" },
    WORKOUT:      { enabled: false, systemDisabled: true,  aiAccess: false, path: "/workout" },
    SLEEP:        { enabled: false, systemDisabled: true,  aiAccess: false, path: "/sleep" },
    MENSTRUATION: { enabled: false, systemDisabled: true,  aiAccess: false, path: "/menstruation" },
    PROJECTS:     { enabled: false, systemDisabled: true,  aiAccess: false, path: "/projects" },
    FOCUS:        { enabled: false, systemDisabled: true,  aiAccess: false, path: "/focus" },
    CALCULATOR:   { enabled: true,  systemDisabled: false, aiAccess: true,  path: "/calculator" },
    DURIA:        { enabled: true,  systemDisabled: false, aiAccess: true,  path: "/duria" },
    SETTINGS:     { enabled: true,  systemDisabled: false, aiAccess: true,  path: "/settings" },
  }
};
