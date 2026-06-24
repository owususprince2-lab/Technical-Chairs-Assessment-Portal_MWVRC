/* MWVRC 2026 — Oral Presentation Assessment Portal
   Shared configuration. Edit this file to change rooms, chairs, or the rubric.
   IMPORTANT: CRITERIA here must stay in sync with the CRITERIA array in
   apps-script/Code.gs (key, weight, and order) — the server recalculates
   the weighted total independently as the source of truth. */

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

  // The official rubric, taken verbatim from
  // "Oral Presentation Judging & Scoring Sheet". Each criterion is rated 1–5
  // (1=Poor, 2=Fair, 3=Good, 4=Very Good, 5=Excellent). Weighted score per
  // criterion = weight × (rating / 5); the total is the sum of those.
  // NOTE: weights as authored sum to 110, not 100 (criteria c2 and c3 are
  // 15% each) — the app reports the true max honestly rather than forcing
  // a "/100" label. Rebalance the weights below if you want it to land on
  // an even 100.
  CRITERIA: [
    { key: "c1",  weight: 10, label: "Relevance & Originality of Topic",
      desc: "How well the study addresses real mineral-waste problems (tailings, slag, red mud, etc.) and offers a fresh angle or genuine contribution to valorization." },
    { key: "c2",  weight: 15, label: "Scientific / Technical Soundness",
      desc: "Correctness of methodology, data, and analysis; logical flow from problem to results to conclusion." },
    { key: "c3",  weight: 15, label: "Clarity of Explanation (Simplifying Technical Terms)",
      desc: "Complex or technical terms (e.g., \u2018geopolymerization\u2019, \u2018leaching kinetics\u2019) are broken down into plain language so a non-specialist audience can follow without losing accuracy." },
    { key: "c4",  weight: 10, label: "Organization & Structure of Presentation",
      desc: "Logical sequence: introduction, problem statement, method, results, conclusion; smooth transitions between sections." },
    { key: "c5",  weight: 10, label: "Use of Visual Aids (Slides, Charts, Diagrams)",
      desc: "Slides are clear, uncluttered, and genuinely support understanding rather than just repeating spoken words." },
    { key: "c6",  weight: 10, label: "Delivery & Speaking Skills",
      desc: "Voice projection, pacing, eye contact, confidence, and ability to engage the audience throughout the talk." },
    { key: "c7",  weight: 10, label: "Personal Appearance & Professionalism",
      desc: "Neatness and appropriateness of dress, posture, body language, and overall professional conduct on stage." },
    { key: "c8",  weight: 10, label: "Time Management",
      desc: "Presentation fits within the allotted time, with balanced coverage of all sections (not rushed or cut short)." },
    { key: "c9",  weight: 10, label: "Q&A Handling",
      desc: "Ability to understand questions, respond accurately and confidently, and clarify technical points simply when challenged." },
    { key: "c10", weight: 10, label: "Practical / Environmental Impact",
      desc: "Strength of the case made for real-world application, sustainability benefit, or industrial relevance of the valorization approach." }
  ]
};

// True maximum achievable total, derived from the weights above (not hardcoded).
CONFIG.MAX_TOTAL = CONFIG.CRITERIA.reduce((s, c) => s + c.weight, 0);
