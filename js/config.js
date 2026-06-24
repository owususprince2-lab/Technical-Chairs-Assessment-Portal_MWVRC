/* MWVRC 2026 — Oral Presentation Assessment Portal
   Shared configuration. Edit this file to change rooms, chairs, or the rubric. */

const CONFIG = {
  // Paste your Apps Script Web App "exec" URL here.
  API_URL: "https://script.google.com/macros/s/AKfycbyKZwHrvjiZk2nKxMbd8fYAnnkp0YpWcEarRkT2gFEhVKSzeYRw4366vZ6e-j8V07rDPg/exec",

  EVENT_NAME: "MWVRC 2026",
  EVENT_FULL: "Mineral Waste Valorization Research Conference",

  ROOMS: {
    A: {
      label: "Room A",
      accent: "rust",
      themes: [
        "T1 · Characterization & Processing of Mineral and Industrial Waste",
        "T4 · Policy & Regulatory Frameworks for Mineral Waste Management in Industry"
      ]
    },
    B: {
      label: "Room B",
      accent: "moss",
      themes: [
        "T2 · Environmental Impact, Remediation & Sustainable Management of Mineral Waste"
      ]
    },
    C: {
      label: "Room C",
      accent: "ochre",
      themes: [
        "T3 · Waste Valorization Technologies & Circular Economy Strategies"
      ]
    }
  },

  // The six technical chairs. `photo` must match a filename you drop into /assets/chairs/
  CHAIRS: [
    { name: "Dr. Efiba Vidda Senkyire Kwarteng", room: "A", title: "Geomatic Engineering · KNUST", photo: "Dr. Efiba Vidda.jpeg" },
    { name: "Dr. Emmanuel Kwesi Arthur",          room: "A", title: "Materials & Metallurgical Eng. · KNUST", photo: "Dr. Emmanuel Arthur.jpeg" },
    { name: "Dr. Miriam Appiah-Brempong",         room: "B", title: "Civil Engineering · KNUST", photo: "Dr. Miriam Brempong.jpeg" },
    { name: "Dr. Henry Agbe",                     room: "B", title: "Materials & Metallurgical Eng. · KNUST", photo: "Dr. Henry Agbe.jpeg" },
    { name: "Dr. Mizpah Ama Dziedzorm Rockson",   room: "C", title: "Chemical Engineering · KNUST", photo: "Dr. Mrs. Mizpah Ama Dziedzorm.jpeg" },
    { name: "Dr. Emmanuela Kwao-Boateng",         room: "C", title: "Chemical Engineering · KNUST", photo: "Dr. Emmanuela Kwao Boateng.jpeg" }
  ],

  // Rubric = the conference's own official "Best Oral Presentation" award criteria.
  // Each is rated 1–5. Max possible total = 20.
  CRITERIA: [
    { key: "findings",   label: "Quality & significance of research findings" },
    { key: "delivery",   label: "Clarity, structure & delivery of the talk" },
    { key: "engagement", label: "Engagement with audience questions" },
    { key: "theme",      label: "Contribution to the conference theme" }
  ],

  MAX_TOTAL: 20
};
