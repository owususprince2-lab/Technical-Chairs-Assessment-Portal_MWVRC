/**
 * MWVRC 2026 — Oral Presentation Assessment Portal — BACKEND
 * ------------------------------------------------------------------
 * Implements the official "Oral Presentation Judging & Scoring Sheet":
 * 10 weighted criteria, each rated 1–5. Weighted score per criterion =
 * weight × (rating / 5); the total is the sum of those.
 *
 * NOTE: the weights below are copied verbatim from the supplied sheet and
 * sum to 110, not 100 (criteria c2 and c3 are weighted 15% each while the
 * rest are 10%). MAX_TOTAL is derived from the weights, so this is honest
 * either way — but if you want scores to land on an even /100, lower c2
 * and/or c3 to 10% (or adjust others) so CRITERIA weights sum to 100.
 *
 * Paste this whole file into the Apps Script project bound to your Google
 * Sheet (the one already deployed at your /exec URL), replacing whatever
 * is in Code.gs. Then run `setup` once (see SETUP NOTES below).
 *
 * Sheet tabs used (auto-created by setup()):
 *   Chairs       — Name | Room | PIN | PinSet
 *   Presenters   — PresenterName | Room | Theme | PresentationTitle
 *   Assessments  — ChairName | Room | PresenterName | c1..c10 | WeightedTotal |
 *                  KeyStrengths | AreasForImprovement | Status | LastUpdated
 *
 * SETUP NOTES (do this once):
 *   1. Open the Apps Script editor (Extensions > Apps Script) from your Sheet.
 *   2. Replace Code.gs with this file's contents. Save.
 *   3. In the function dropdown at the top, choose `setup`, click Run once.
 *      (It will ask you to authorize — allow it.) This creates the three
 *      tabs above and seeds the 6 chairs.
 *   4. Open the "Presenters" tab and replace the SAMPLE row with your real
 *      presenters: Name, Room (A/B/C), Theme, and Presentation Title.
 *   5. Deploy > Manage deployments > (pencil icon on your existing
 *      deployment) > Version: "New version" > Deploy.
 *      This pushes this code live at your EXISTING /exec URL — no need to
 *      change the URL in the frontend.
 * ------------------------------------------------------------------
 */

const SHEET_CHAIRS = 'Chairs';
const SHEET_PRESENTERS = 'Presenters';
const SHEET_ASSESSMENTS = 'Assessments';

// Mirrors js/config.js CONFIG.CRITERIA — keep key + weight + order in sync.
const CRITERIA = [
  { key: 'c1',  weight: 10 },
  { key: 'c2',  weight: 15 },
  { key: 'c3',  weight: 15 },
  { key: 'c4',  weight: 10 },
  { key: 'c5',  weight: 10 },
  { key: 'c6',  weight: 10 },
  { key: 'c7',  weight: 10 },
  { key: 'c8',  weight: 10 },
  { key: 'c9',  weight: 10 },
  { key: 'c10', weight: 10 }
];
const MAX_TOTAL = CRITERIA.reduce((s, c) => s + c.weight, 0); // 110 as authored

// Column layout of the Assessments sheet (1-indexed for getRange, 0-indexed for arrays)
const ASSESS_FIXED_COLS = 3;                 // ChairName, Room, PresenterName
const ASSESS_CRITERIA_START = 3;              // 0-indexed array position where c1 starts
const ASSESS_AFTER_CRITERIA = ASSESS_CRITERIA_START + CRITERIA.length; // WeightedTotal index

// ---------------------------------------------------------------- SETUP ---

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let chairs = ss.getSheetByName(SHEET_CHAIRS);
  if (!chairs) chairs = ss.insertSheet(SHEET_CHAIRS);
  if (chairs.getLastRow() === 0) {
    chairs.appendRow(['Name', 'Room', 'PIN', 'PinSet']);
    const seedChairs = [
      ['Dr. Efiba Vidda Senkyire Kwarteng', 'A', '', false],
      ['Dr. Emmanuel Kwesi Arthur', 'A', '', false],
      ['Dr. Miriam Appiah-Brempong', 'B', '', false],
      ['Dr. Henry Agbe', 'B', '', false],
      ['Dr. Mizpah Ama Dziedzorm Rockson', 'C', '', false],
      ['Dr. Emmanuela Kwao-Boateng', 'C', '', false]
    ];
    seedChairs.forEach(r => chairs.appendRow(r));
    chairs.setFrozenRows(1);
  }

  let presenters = ss.getSheetByName(SHEET_PRESENTERS);
  if (!presenters) presenters = ss.insertSheet(SHEET_PRESENTERS);
  if (presenters.getLastRow() === 0) {
    presenters.appendRow(['PresenterName', 'Room', 'Theme', 'PresentationTitle']);
    presenters.appendRow(['SAMPLE — replace with a real presenter, or delete this row', 'A', 'T1', 'Sample presentation title']);
    presenters.setFrozenRows(1);
  }

  let assessments = ss.getSheetByName(SHEET_ASSESSMENTS);
  if (!assessments) assessments = ss.insertSheet(SHEET_ASSESSMENTS);
  if (assessments.getLastRow() === 0) {
    const header = ['ChairName', 'Room', 'PresenterName']
      .concat(CRITERIA.map(c => c.key))
      .concat(['WeightedTotal', 'KeyStrengths', 'AreasForImprovement', 'Status', 'LastUpdated']);
    assessments.appendRow(header);
    assessments.setFrozenRows(1);
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Setup complete: Chairs, Presenters, Assessments tabs are ready.');
}

// ------------------------------------------------------------- ROUTING ----

function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;
    switch (action) {
      case 'ping':             result = { ok: true }; break;
      case 'getChairs':        result = getChairs(); break;
      case 'getPresenters':    result = getPresenters(e.parameter.room); break;
      case 'getAssessment':    result = getAssessment(e.parameter.chair, e.parameter.presenter); break;
      case 'getMyAssessments': result = getMyAssessments(e.parameter.chair); break;
      case 'getResults':       result = getResults(); break;
      default:                 result = { error: 'Unknown action: ' + action };
    }
    return jsonOut(result);
  } catch (err) {
    return jsonOut({ error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let result;
    switch (action) {
      case 'createPin':      result = createPin(body.name, body.pin); break;
      case 'login':          result = login(body.name, body.pin); break;
      case 'saveAssessment': result = saveAssessment(body); break;
      default:               result = { error: 'Unknown action: ' + action };
    }
    return jsonOut(result);
  } catch (err) {
    return jsonOut({ error: err.message });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------- SHEET ACCESS -

function sheetChairs()      { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CHAIRS); }
function sheetPresenters()  { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRESENTERS); }
function sheetAssessments() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ASSESSMENTS); }

function findChairRow(name) {
  const rows = sheetChairs().getDataRange().getValues();
  const target = String(name).trim().toLowerCase();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toLowerCase() === target) {
      return { rowIndex: i + 1, row: rows[i] };
    }
  }
  return null;
}

function findAssessmentRow(chairName, presenterName) {
  const rows = sheetAssessments().getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(chairName).trim() &&
        String(rows[i][2]).trim() === String(presenterName).trim()) {
      return { rowIndex: i + 1, row: rows[i] };
    }
  }
  return null;
}

function isTrue(v) { return v === true || String(v).toUpperCase() === 'TRUE'; }

// ------------------------------------------------------------- CHAIRS -----

function getChairs() {
  const rows = sheetChairs().getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const [name, room, pin, pinSet] = rows[i];
    if (!name) continue;
    out.push({ name: name, room: room, pinSet: isTrue(pinSet) });
  }
  return { chairs: out };
}

function createPin(name, pin) {
  if (!/^\d{4}$/.test(String(pin))) {
    return { success: false, error: 'PIN must be exactly 4 digits.' };
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const found = findChairRow(name);
    if (!found) return { success: false, error: 'Chair not recognized. Contact the organiser.' };
    const room = found.row[1];
    const pinSet = found.row[3];
    if (isTrue(pinSet)) {
      return { success: false, error: 'A PIN is already set for this name. Please log in instead.' };
    }
    const sh = sheetChairs();
    sh.getRange(found.rowIndex, 3).setValue(String(pin));
    sh.getRange(found.rowIndex, 4).setValue(true);
    return { success: true, room: room };
  } finally {
    lock.releaseLock();
  }
}

function login(name, pin) {
  const found = findChairRow(name);
  if (!found) return { success: false, error: 'Chair not recognized. Contact the organiser.' };
  const room = found.row[1];
  const existingPin = found.row[2];
  const pinSet = found.row[3];
  if (!isTrue(pinSet)) {
    return { success: false, error: 'No PIN set yet — please create one first.', needsPin: true };
  }
  if (String(existingPin) !== String(pin)) {
    return { success: false, error: 'Incorrect PIN.' };
  }
  return { success: true, room: room };
}

// ----------------------------------------------------------- PRESENTERS ---

function getPresenters(room) {
  const rows = sheetPresenters().getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const [presenterName, presenterRoom, theme, presentationTitle] = rows[i];
    if (!presenterName) continue;
    if (room && String(presenterRoom).trim() !== String(room).trim()) continue;
    out.push({ presenterName: presenterName, room: presenterRoom, theme: theme, presentationTitle: presentationTitle });
  }
  return { presenters: out };
}

function presenterInfoMap() {
  const rows = sheetPresenters().getDataRange().getValues();
  const map = {};
  for (let i = 1; i < rows.length; i++) {
    map[rows[i][0]] = { theme: rows[i][2], presentationTitle: rows[i][3] };
  }
  return map;
}

// ---------------------------------------------------------- ASSESSMENTS ---

function rowToAssessment(row) {
  const scores = {};
  CRITERIA.forEach((c, i) => { scores[c.key] = row[ASSESS_CRITERIA_START + i]; });
  return {
    scores: scores,
    weightedTotal: row[ASSESS_AFTER_CRITERIA],
    keyStrengths: row[ASSESS_AFTER_CRITERIA + 1],
    areasForImprovement: row[ASSESS_AFTER_CRITERIA + 2],
    status: row[ASSESS_AFTER_CRITERIA + 3]
  };
}

function getAssessment(chairName, presenterName) {
  const found = findAssessmentRow(chairName, presenterName);
  if (!found) return { exists: false };
  return Object.assign({ exists: true }, rowToAssessment(found.row));
}

function getMyAssessments(chairName) {
  const rows = sheetAssessments().getDataRange().getValues();
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() !== String(chairName).trim()) continue;
    out.push(Object.assign({ presenterName: rows[i][2] }, rowToAssessment(rows[i])));
  }
  return { assessments: out };
}

// Weighted total = sum over criteria of weight × (rating/5), counting only
// validly-rated (1-5) criteria. Unrated criteria contribute 0 — this lets
// drafts be saved with partial ratings without throwing an error.
function computeWeightedTotal(scores) {
  let total = 0;
  CRITERIA.forEach(c => {
    const r = Number(scores[c.key]);
    if (r >= 1 && r <= 5) total += (r / 5) * c.weight;
  });
  return Math.round(total * 10) / 10;
}

function saveAssessment(body) {
  const chairName = body.chairName;
  const room = body.room;
  const presenterName = body.presenterName;
  const scores = body.scores || {};
  const submit = !!body.submit;
  const keyStrengths = body.keyStrengths || '';
  const areasForImprovement = body.areasForImprovement || '';

  // Normalize each criterion to a valid 1-5 number, or '' if not (yet) rated.
  const cleanScores = {};
  CRITERIA.forEach(c => {
    const r = Number(scores[c.key]);
    cleanScores[c.key] = (r >= 1 && r <= 5) ? r : '';
  });

  if (submit) {
    const missing = CRITERIA.filter(c => cleanScores[c.key] === '');
    if (missing.length > 0) {
      throw new Error('All criteria must be rated (1-5) before submitting.');
    }
  }

  const total = computeWeightedTotal(cleanScores);
  const status = submit ? 'Submitted' : 'Draft';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheetAssessments();
    const found = findAssessmentRow(chairName, presenterName);
    const rowData = [chairName, room, presenterName]
      .concat(CRITERIA.map(c => cleanScores[c.key]))
      .concat([total, keyStrengths, areasForImprovement, status, new Date()]);
    if (found) {
      sh.getRange(found.rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sh.appendRow(rowData);
    }
    return { success: true, total: total, status: status };
  } finally {
    lock.releaseLock();
  }
}

// --------------------------------------------------------------- RESULTS --

function getResults() {
  const rows = sheetAssessments().getDataRange().getValues();
  const byPresenter = {}; // presenterName -> {room, totals:[]}

  for (let i = 1; i < rows.length; i++) {
    const presenterName = rows[i][2];
    const room = rows[i][1];
    const status = rows[i][ASSESS_AFTER_CRITERIA + 3];
    const total = rows[i][ASSESS_AFTER_CRITERIA];
    if (!presenterName || status !== 'Submitted') continue;
    if (!byPresenter[presenterName]) byPresenter[presenterName] = { room: room, totals: [] };
    byPresenter[presenterName].totals.push(Number(total));
  }

  const pInfo = presenterInfoMap();

  const out = Object.keys(byPresenter).map(presenterName => {
    const entry = byPresenter[presenterName];
    const avg = entry.totals.reduce((s, x) => s + x, 0) / entry.totals.length;
    const info = pInfo[presenterName] || {};
    return {
      presenterName: presenterName,
      room: entry.room,
      theme: info.theme || '',
      presentationTitle: info.presentationTitle || '',
      averageTotal: Math.round(avg * 10) / 10,
      maxTotal: MAX_TOTAL,
      assessorsCount: entry.totals.length
    };
  });

  out.sort((a, b) => b.averageTotal - a.averageTotal);
  return { results: out };
}
