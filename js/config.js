// ─────────────────────────────────────────────────────────────────────────────
// MWVRC 2026  ·  config.js
// Edit this file to update chairs, rooms, oral presenters, and posters.
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {

  // ── Session Chairs ────────────────────────────────────────────────────────
  // Each chair has an id, display name, room assignment, and initials (avatar).
  chairs: [
{ id: "c1", name: "Dr. Efiba Vidda Senkyire Kwarteng", room: "Room A", initials: "EV" },
{ id: "c2", name: "Dr. Emmanuel Kwesi Arthur", room: "Room A", initials: "EA" },

{ id: "c3", name: "Dr. Miriam Appiah-Brempong", room: "Room B", initials: "MA" },
{ id: "c4", name: "Dr. Henry Agbe", room: "Room B", initials: "HA" },

{ id: "c5", name: "Dr. Mizpah Ama Dziedzorm Rockson", room: "Room C", initials: "MR" },
{ id: "c6", name: "Dr. Emmanuela Kwao-Boateng", room: "Room C", initials: "EK" },
],



  // ── Oral Presenters (by room) ─────────────────────────────────────────────
  // Chairs only score presenters in their own room.
  rooms: {
    "Room A": [
      { id: "p1",  name: "Afia Boateng",         title: "Phosphogypsum valorisation in road construction" },
      { id: "p2",  name: "Samuel Adjei",          title: "Red mud as supplementary cementitious material" },
      { id: "p3",  name: "Miriam Osei",           title: "Fly ash geopolymers for heavy-metal immobilisation" },
      { id: "p4",  name: "Kofi Antwi",            title: "Mine tailings in ceramic tile production" },
      { id: "p5",  name: "Esi Darko",             title: "Slag-based alkali-activated mortars" },
    ],
    "Room B": [
      { id: "p6",  name: "Carlos Ribeiro",        title: "Lithium mine tailings as raw ceramic materials" },
      { id: "p7",  name: "Ana Lopes",             title: "Recovery of rare earths from mine waste" },
      { id: "p8",  name: "João Santos",           title: "Phosphate slimes in agricultural amendment" },
      { id: "p9",  name: "Beatriz Costa",         title: "Copper tailings as concrete aggregate" },
      { id: "p10", name: "Rui Ferreira",          title: "Zinc smelter slag in asphalt mixtures" },
    ],
    "Room C": [
      { id: "p11", name: "Hana Kobayashi",        title: "Steel slag carbonation for CO₂ capture" },
      { id: "p12", name: "Taro Yamamoto",         title: "Iron ore tailings in earthen construction" },
      { id: "p13", name: "Saki Watanabe",         title: "Nickel laterite by-products in glass ceramics" },
      { id: "p14", name: "Kenji Nakamura",        title: "Gold tailings neutralisation and reuse" },
      { id: "p15", name: "Yuki Suzuki",           title: "Manganese residues as soil conditioner" },
    ],
  },

  // ── Oral Assessment Rubric ────────────────────────────────────────────────
  oralCriteria: [
    {
      id: "content",
      label: "Scientific Content & Technical Merit",
      max: 30,
      descriptors: {
        excellent: "Thorough, rigorous, well-supported conclusions (25–30)",
        good:      "Sound methodology and analysis (18–24)",
        fair:      "Weaknesses in methodology or interpretation (10–17)",
        poor:      "Major flaws or unsupported conclusions (0–9)",
      },
    },
    {
      id: "delivery",
      label: "Presentation Delivery & Clarity",
      max: 25,
      descriptors: {
        excellent: "Engaging, clear, well-paced, professional (21–25)",
        good:      "Generally clear with minor delivery issues (15–20)",
        fair:      "Some clarity issues, pacing problems (8–14)",
        poor:      "Difficult to follow (0–7)",
      },
    },
    {
      id: "visuals",
      label: "Visual Aids & Slide Design",
      max: 20,
      descriptors: {
        excellent: "Polished, informative, uncluttered visuals (17–20)",
        good:      "Clear visuals with minor issues (12–16)",
        fair:      "Cluttered or unclear in places (6–11)",
        poor:      "Visuals hinder understanding (0–5)",
      },
    },
    {
      id: "qa",
      label: "Q&A Engagement",
      max: 15,
      descriptors: {
        excellent: "Insightful, confident responses (13–15)",
        good:      "Adequate responses with minor gaps (9–12)",
        fair:      "Struggles with some questions (5–8)",
        poor:      "Unable to address questions (0–4)",
      },
    },
    {
      id: "innovation",
      label: "Innovation & Relevance to Mineral Waste",
      max: 10,
      descriptors: {
        excellent: "Highly innovative, clear valorisation impact (9–10)",
        good:      "Relevant with some innovative elements (6–8)",
        fair:      "Limited innovation or partial relevance (3–5)",
        poor:      "Little relevance to mineral waste valorisation (0–2)",
      },
    },
  ],

  // ── Poster Rubric ─────────────────────────────────────────────────────────
  // 4 categories × 10 pts each = 40 pts total
  posterCriteria: [
    {
      id: "design",
      label: "Poster Design & Visual Appeal",
      max: 10,
      descriptors: {
        excellent: "Visually attractive, uncluttered, professional graphics (9–10)",
        good:      "Generally clear; minor layout issues (6–8)",
        fair:      "Somewhat cluttered or poorly designed graphics (3–5)",
        poor:      "Overcrowded; graphics don't support content (1–2)",
      },
    },
    {
      id: "organisation",
      label: "Organisation & Clarity",
      max: 10,
      descriptors: {
        excellent: "Logical flow; understood without extra explanation (9–10)",
        good:      "Most sections logical; minor gaps (6–8)",
        fair:      "Inconsistent organisation; some sections hard to follow (3–5)",
        poor:      "Lacks logical structure (1–2)",
      },
    },
    {
      id: "science",
      label: "Scientific Quality & Technical Merit",
      max: 10,
      descriptors: {
        excellent: "Rigorous methodology, accurate analysis, cited literature (9–10)",
        good:      "Scientifically sound; adequate methodology (6–8)",
        fair:      "Weaknesses in methodology or interpretation (3–5)",
        poor:      "Lacks rigour; major flaws (1–2)",
      },
    },
    {
      id: "innovation",
      label: "Innovation, Impact & Relevance to Mineral Waste Valorisation",
      max: 10,
      descriptors: {
        excellent: "Highly innovative; clear valorisation/circular-economy impact (9–10)",
        good:      "Relevant; some potential impact or application (6–8)",
        fair:      "Partial relevance; limited innovation (3–5)",
        poor:      "Little relevance to mineral waste valorisation (1–2)",
      },
    },
  ],

  // ── Poster List (20 posters, scored by ALL session chairs) ───────────────
 posters: [
{ id: "poster1",  number: "MWV-009", author: "Bright Amankwah Wilson", title: "Strengthening Policy and Regulatory Frameworks for Sustainable Mineral Waste Management in Industry" },
{ id: "poster2",  number: "MWV-015", author: "Dr. Bennetta Koomson", title: "Recovery of Potassium from Spent Alkaline Batteries Using Water" },
{ id: "poster3",  number: "MWV-017", author: "Margaret Baamah Patterson", title: "Bio-Based Facade Composites from Agro-Industrial and Textile Fibre Waste: A Scoping Review" },
{ id: "poster4",  number: "MWV-018", author: "Okesola Abayomi Adeyemo", title: "Bridging the Remediation Gap: A Comparative Analysis and Strategic Roadmap for Mineral Waste Valorization in Nigeria through Phytoremediation" },
{ id: "poster5",  number: "MWV-019", author: "Gideon Owusu", title: "Regeneration of Spent Bleaching Earth: Optimization and Reusability Studies" },
{ id: "poster6",  number: "MWV-020", author: "Turkson Jesse Takyi", title: "Python-Based Process Modelling and Optimization of Pyrolysis Valorization of Palm Kernel Shells and Empty Fruit Bunches for Biochar Production" },
{ id: "poster7",  number: "MWV-022", author: "George Dzidefo Torku", title: "Characterization of Physicochemical Properties and Environmental Risk Assessment of Mined Tailings: A Case Study for Sustainable Waste Management" },
{ id: "poster8",  number: "MWV-023", author: "Prof. James Ransford Dankwah", title: "Suitability of Charred Corn Cob and its Blends with End-of-Life HDPE as Reductants for Iron and Steelmaking Technologies" },
{ id: "poster9",  number: "MWV-024", author: "John Boateng Nkansah", title: "Synthesis and Characterization of Kaolin-Biochar Composites from Agricultural Waste for Environmental Remediation" },
{ id: "poster10", number: "MWV-025", author: "Prof. James Ransford Dankwah", title: "Electrowinning of Metallic Iron from Non-Circulated Sulphate Electrolyte using Graphite Rods Recovered from Spent Zinc Carbon Batteries as Electrodes" },
{ id: "poster11", number: "MWV-026", author: "Jessica Dankwah", title: "Utilisation of End-of-Life Plastics as Reductant for the Production of Metallic Copper from Tenorite (CuO) Ore" },
{ id: "poster12", number: "MWV-027", author: "Vincent Appiah", title: "Response Surface Optimization and Kinetics Studies of Lead Leaching from Fire Assay Slag with Acetic Acid" },
{ id: "poster13", number: "MWV-021", author: "Micheal Olawale", title: "Gold, Governance, and Illegality: Rethinking the Historical Foundations of Environmental Crime in Ghana" },
{ id: "poster14", number: "MWV-029", author: "Hasan Idrees", title: "Nanofiltration-Based Treatment of Mine Water: Lessons from Germany and South Africa under the MAMDIWAS Project" },
{ id: "poster15", number: "MWV-031", author: "Priscilla Badaweh Coffie", title: "Vegetation-Based Valorization of Degraded Mine Soils: A Density-Optimized Mucuna Pruriens Approach for Sustainable Mineral Waste Remediation" },
{ id: "poster16", number: "MWV-032", author: "Lilian Akpene Diaba", title: "Synthesis and Characterization of Perovskite nanocrystals using lead from spent cupels" },
{ id: "poster17", number: "MWV-033", author: "Kwabena Boakye", title: "Sustainable Reuse of Heap Leach Mine Waste as Construction Material" },
{ id: "poster18", number: "MWV-034", author: "Delali Adjei", title: "Valorization of Granite Quarry Dust as Mineral Filler in Portland Cement: Mechanical Performance and Durability Assessment" },
{ id: "poster19", number: "MWV-035", author: "Lucas Landwehrkamp", title: "Europe’s Thirst for Activated Carbon and A Potential Answer? Dual-Use Adsorbents from Drinking Water Treatment Sludge" },
{ id: "poster20", number: "MWV-036", author: "Lord Addo Hanson", title: "Sustainable Ternary Binders: Evaluating the Performance of Low-Grade Kaolinitic Clay in Limestone Calcined Clay Cement (LC3)" }
],

  // ── Rating Labels ─────────────────────────────────────────────────────────
  posterRatingLabel(total) {
    if (total >= 36) return "Outstanding Poster";
    if (total >= 31) return "Excellent Poster";
    if (total >= 26) return "Very Good Poster";
    if (total >= 21) return "Good Poster";
    return "Needs Improvement";
  },
};
