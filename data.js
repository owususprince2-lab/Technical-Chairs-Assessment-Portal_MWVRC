/* ═══════════════════════════════════════════
   MWVRC 2026 — Data: chairs & rubric content
   ═══════════════════════════════════════════ */

const CHAIRS = [
  {
    id: 'efiba',
    name: 'Dr. Efiba Vidda Senkyire Kwarteng',
    dept: 'Geomatic Engineering · KNUST',
    room: 'A',
    oral: [1, 2, 3, 4, 5]
  },
  {
    id: 'arthur',
    name: 'Dr. Emmanuel Kwesi Arthur',
    dept: 'Materials & Metallurgical Eng. · KNUST',
    room: 'A',
    oral: [6, 7, 8, 9, 10]
  },
  {
    id: 'brempong',
    name: 'Dr. Miriam Appiah-Brempong',
    dept: 'Civil Engineering · KNUST',
    room: 'B',
    oral: [11, 12, 13, 14, 15]
  },
  {
    id: 'agbe',
    name: 'Dr. Henry Agbe',
    dept: 'Materials & Metallurgical Eng. · KNUST',
    room: 'B',
    oral: [16, 17, 18, 19, 20]
  },
  {
    id: 'rockson',
    name: 'Dr. Mizpah Ama Dziedzorm Rockson',
    dept: 'Chemical Engineering · KNUST',
    room: 'C',
    oral: [21, 22, 23, 24, 25]
  },
  {
    id: 'kwao',
    name: 'Dr. Emmanuela Kwao-Boateng',
    dept: 'Chemical Engineering · KNUST',
    room: 'C',
    oral: [26, 27, 28, 29, 30]
  }
];

const ORAL_RUBRIC = [
  {
    key: 'background',
    label: 'Background & Context',
    max: 4,
    info: {
      excellent: 'Provides comprehensive background, synthesizes relevant literature, and clearly establishes the significance of the research within mineral waste valorization and sustainability.',
      good: 'Provides relevant background and literature with clear connection to the research topic.',
      fair: 'Provides limited background with weak connection to the research problem.',
      poor: 'Provides little or no relevant background or context.'
    }
  },
  {
    key: 'objectives',
    label: 'Research Objectives & Significance',
    max: 4,
    info: {
      excellent: 'Objectives are clearly defined, scientifically relevant, and address an important challenge in mineral waste valorization.',
      good: 'Objectives are clear and relevant but could be more focused or impactful.',
      fair: 'Objectives are somewhat unclear or lack sufficient relevance.',
      poor: 'Objectives are unclear or absent.'
    }
  },
  {
    key: 'methodology',
    label: 'Methodology & Technical Rigor',
    max: 4,
    info: {
      excellent: 'Methods are clearly described, scientifically rigorous, appropriate, and demonstrate innovation where applicable.',
      good: 'Methods are appropriate and adequately described.',
      fair: 'Methods are only partially explained or contain weaknesses.',
      poor: 'Methods are poorly described or inappropriate.'
    }
  },
  {
    key: 'results',
    label: 'Results, Analysis & Interpretation',
    max: 4,
    info: {
      excellent: 'Results are clearly presented, thoroughly analyzed, and effectively interpreted in relation to the objectives.',
      good: 'Results are clearly presented with adequate analysis and interpretation.',
      fair: 'Results are presented but analysis or interpretation is limited.',
      poor: 'Results are unclear, incomplete, or poorly interpreted.'
    }
  },
  {
    key: 'conclusions',
    label: 'Conclusions & Future Perspective',
    max: 4,
    info: {
      excellent: 'Conclusions are well supported by findings, demonstrate contribution to the field, and identify future research opportunities or applications.',
      good: 'Conclusions are supported by findings and include some discussion of implications.',
      fair: 'Conclusions are weakly supported or lack future perspective.',
      poor: 'Conclusions are absent or unsupported.'
    }
  },
  {
    key: 'innovation',
    label: 'Innovation & Impact',
    max: 4,
    info: {
      excellent: 'Research demonstrates strong innovation and significant potential for waste valorization, resource recovery, circular economy, or environmental sustainability.',
      good: 'Research demonstrates moderate innovation and potential impact.',
      fair: 'Research demonstrates limited innovation or impact.',
      poor: 'Research demonstrates little innovation or relevance.'
    }
  },
  {
    key: 'delivery',
    label: 'Presentation Delivery & Professionalism',
    max: 4,
    info: {
      excellent: 'Demonstrates mastery of the topic, communicates confidently and clearly, maintains audience engagement, adheres to time limits, responds effectively to questions, and exhibits a highly professional appearance and demeanor.',
      good: 'Communicates clearly, answers most questions adequately, maintains audience engagement, and demonstrates a professional appearance and conduct.',
      fair: 'Shows limited confidence or struggles with communication; audience engagement is limited; professional appearance or conduct is inconsistent.',
      poor: 'Unprepared, unclear, unable to answer questions effectively, poor audience engagement, and unprofessional appearance or demeanor.'
    }
  },
  {
    key: 'visuals',
    label: 'Visual Aids & Organization',
    max: 4,
    info: {
      excellent: 'Slides are visually appealing, well organized, easy to read, and significantly enhance understanding of the research.',
      good: 'Slides are clear and organized with minor design issues.',
      fair: 'Slides contain organizational or readability issues.',
      poor: 'Slides are poorly organized, difficult to read, or distract from the presentation.'
    }
  }
];

/* Poster rubric: scored 1–10 per category, total /40 */
const POSTER_RUBRIC = [
  {
    key: 'design',
    label: 'Poster Design & Visual Appeal',
    max: 10,
    ranges: [[1,2,'Poor'],[3,5,'Fair'],[6,8,'Good'],[9,10,'Excellent']],
    info: {
      excellent: '(9–10) Poster is visually attractive, uncluttered, easy to read, and professionally designed. Graphics, tables, and figures effectively support the content.',
      good: '(6–8) Poster is generally clear and readable. Design supports content but may contain minor layout issues.',
      fair: '(3–5) Poster is somewhat cluttered, difficult to read in places, or contains poorly designed graphics.',
      poor: '(1–2) Poster is overcrowded, difficult to follow, and graphics do not support the content.'
    }
  },
  {
    key: 'organization',
    label: 'Organization & Clarity',
    max: 10,
    ranges: [[1,2,'Poor'],[3,5,'Fair'],[6,8,'Good'],[9,10,'Excellent']],
    info: {
      excellent: '(9–10) Objectives, methods, results, and conclusions are logically organized. Information flows naturally and can be understood without additional explanation.',
      good: '(6–8) Most sections are logically arranged with only minor gaps in flow or clarity.',
      fair: '(3–5) Organization is inconsistent; some sections are difficult to follow.',
      poor: '(1–2) Poster lacks logical structure and is difficult to understand.'
    }
  },
  {
    key: 'scientific',
    label: 'Scientific Quality & Technical Merit',
    max: 10,
    ranges: [[1,2,'Poor'],[3,5,'Fair'],[6,8,'Good'],[9,10,'Excellent']],
    info: {
      excellent: '(9–10) Research demonstrates strong scientific rigor, clear methodology, accurate analysis, and well-supported conclusions. Literature is appropriately cited.',
      good: '(6–8) Research is scientifically sound with adequate methodology and analysis. Conclusions are generally supported by findings.',
      fair: '(3–5) Scientific content shows weaknesses in methodology, analysis, interpretation, or supporting evidence.',
      poor: '(1–2) Research lacks scientific rigor, contains major flaws, or conclusions are unsupported.'
    }
  },
  {
    key: 'innovation',
    label: 'Innovation, Impact & Relevance to Mineral Waste Valorization',
    max: 10,
    ranges: [[1,2,'Poor'],[3,5,'Fair'],[6,8,'Good'],[9,10,'Excellent']],
    info: {
      excellent: '(9–10) Research presents innovative ideas with clear potential for waste valorization, resource recovery, sustainability, circular economy, or industrial application. Impact is clearly demonstrated.',
      good: '(6–8) Research is relevant to mineral waste valorization and shows some potential impact or application.',
      fair: '(3–5) Relevance and impact are only partially demonstrated. Innovation is limited.',
      poor: '(1–2) Research has little apparent relevance to mineral waste valorization or practical impact.'
    }
  }
];

/* Rating label helpers */
function oralRating(score) {
  if (score >= 28) return 'Outstanding';
  if (score >= 24) return 'Excellent';
  if (score >= 20) return 'Very Good';
  if (score >= 16) return 'Good';
  if (score >   0) return 'Needs Improvement';
  return '—';
}

function posterRating(score) {
  if (score >= 36) return 'Outstanding';
  if (score >= 31) return 'Excellent';
  if (score >= 26) return 'Very Good';
  if (score >= 21) return 'Good';
  if (score >   0) return 'Needs Improvement';
  return '—';
}
