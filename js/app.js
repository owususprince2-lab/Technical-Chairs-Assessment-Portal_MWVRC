/* MWVRC 2026 — Oral Presentation Assessment Portal — Frontend logic */

const STORAGE_KEY = 'mwvrc_session';
const DRAFT_PREFIX = 'mwvrc_draft_'; // local safety-net cache, mirrors what's saved server-side

let session = null;     // {name, room}
let pickedChair = null; // chair object while on the login screen
let currentPresenter = null; // {presenterName, room, theme} while on assessment screen
let currentScores = {};      // {findings:..., delivery:..., engagement:..., theme:...}
let currentStatus = 'none';  // none | draft | submitted
let presentersCache = [];
let resultsFilter = 'all';

// ---------------------------------------------------------------- helpers --

function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function initials(name){
  return name.replace(/^Dr\.?\s*(Mrs\.?)?\s*/i,'').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
}

// One global handler covers every <img class="avatar"> on the page —
// if the photo file isn't there yet, swap it for a clean initials circle.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img.tagName === 'IMG' && img.classList.contains('avatar'))) return;
  const div = document.createElement('div');
  div.className = img.className;
  div.textContent = img.dataset.initials || '';
  img.replaceWith(div);
}, true);

function avatarMarkup(chair, sizeClass){
  const cls = 'avatar' + (sizeClass ? ' ' + sizeClass : '');
  const src = `assets/chairs/${encodeURIComponent(chair.photo)}`;
  return `<img class="${cls}" src="${src}" alt="${chair.name}" data-initials="${initials(chair.name)}">`;
}

function showToast(msg, isError){
  const t = $('#toast');
  t.textContent = msg;
  t.className = isError ? 'show error' : 'show';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> t.className = '', 2400);
}

function setLoading(btn, loading, label){
  if (loading){
    btn.dataset.label = btn.dataset.label || btn.textContent;
    btn.innerHTML = '<span class="loader"></span>';
    btn.disabled = true;
  } else {
    btn.textContent = label || btn.dataset.label || btn.textContent;
    btn.disabled = false;
  }
}

// ----------------------------------------------------------------- API ----
// We POST as text/plain to avoid a CORS preflight (Apps Script doesn't handle
// OPTIONS). The server parses e.postData.contents as JSON regardless.

async function apiGet(params){
  const url = new URL(CONFIG.API_URL);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

async function apiPost(body){
  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

// -------------------------------------------------------------- session ---

function saveSession(s){
  session = s;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
function loadSession(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch(e){ return null; }
}
function clearSession(){
  session = null;
  localStorage.removeItem(STORAGE_KEY);
}

// --------------------------------------------------------- screen control -

function showLoginScreen(){
  $('#screen-login').classList.remove('hidden');
  $('#screen-app').classList.add('hidden');
}
function showAppScreen(){
  $('#screen-login').classList.add('hidden');
  $('#screen-app').classList.remove('hidden');
  $('#nav-who').textContent = session.name;
  goToRoomTab();
}

function setActiveTab(tab){
  $('#tab-room').classList.toggle('active', tab==='room');
  $('#tab-results').classList.toggle('active', tab==='results');
  $('#view-room').classList.toggle('hidden', tab!=='room');
  $('#view-assess').classList.toggle('hidden', true);
  $('#view-results').classList.toggle('hidden', tab!=='results');
}

// ============================================================ LOGIN FLOW ==

function renderChairGrid(){
  const grid = $('#chair-grid');
  grid.innerHTML = '';
  CONFIG.CHAIRS.forEach(chair => {
    const card = document.createElement('div');
    card.className = 'chair-card';
    card.dataset.room = chair.room;
    card.innerHTML = `
      ${avatarMarkup(chair)}
      <div class="name">${chair.name}</div>
      <span class="room-pill ${chair.room}">Room ${chair.room}</span>
    `;
    card.addEventListener('click', () => pickChair(chair));
    grid.appendChild(card);
  });
}

async function pickChair(chair){
  pickedChair = chair;
  $('#step-pick').classList.add('hidden');
  $('#step-pin').classList.remove('hidden');
  $('#picked-name').textContent = chair.name;
  $('#picked-room').textContent = `Room ${chair.room} · ${chair.title}`;
  $('#picked-avatar').innerHTML = avatarMarkup(chair, 'sm');

  $('#create-pin-form').classList.add('hidden');
  $('#enter-pin-form').classList.add('hidden');
  clearPinInputs('new'); clearPinInputs('confirm'); clearPinInputs('enter');
  $('#create-pin-error').textContent = '';
  $('#enter-pin-error').textContent = '';

  try {
    const res = await apiGet({ action: 'getChairs' });
    const match = (res.chairs || []).find(c => c.name === chair.name);
    if (match && match.pinSet){
      $('#enter-pin-form').classList.remove('hidden');
      focusPinGroup('enter');
    } else {
      $('#create-pin-form').classList.remove('hidden');
      focusPinGroup('new');
    }
  } catch (e){
    showToast('Could not reach the server. Check your connection.', true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $('#btn-back-to-pick').addEventListener('click', () => {
    $('#step-pick').classList.remove('hidden');
    $('#step-pin').classList.add('hidden');
    pickedChair = null;
  });

  // auto-advance between PIN boxes
  $all('.pin-dots-input').forEach(group => {
    const inputs = $all('input', group);
    inputs.forEach((inp, idx) => {
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/[^0-9]/g,'').slice(0,1);
        if (inp.value && idx < inputs.length-1) inputs[idx+1].focus();
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && idx>0) inputs[idx-1].focus();
      });
    });
  });

  $('#btn-create-pin').addEventListener('click', onCreatePin);
  $('#btn-login').addEventListener('click', onLogin);
  $('#btn-logout').addEventListener('click', (e) => {
    e.preventDefault();
    clearSession();
    currentPresenter = null;
    location.reload();
  });
  $('#tab-room').addEventListener('click', goToRoomTab);
  $('#tab-results').addEventListener('click', goToResultsTab);

  init();
});

function clearPinInputs(group){
  $all(`.pin-dots-input[data-group="${group}"] input`).forEach(i => i.value = '');
}
function readPinInputs(group){
  return $all(`.pin-dots-input[data-group="${group}"] input`).map(i => i.value).join('');
}
function focusPinGroup(group){
  const first = $(`.pin-dots-input[data-group="${group}"] input`);
  if (first) setTimeout(()=>first.focus(), 50);
}

async function onCreatePin(){
  const pin = readPinInputs('new');
  const confirm = readPinInputs('confirm');
  const errEl = $('#create-pin-error');
  errEl.textContent = '';

  if (pin.length !== 4){ errEl.textContent = 'Enter all 4 digits.'; return; }
  if (pin !== confirm){ errEl.textContent = 'PINs do not match.'; return; }

  const btn = $('#btn-create-pin');
  setLoading(btn, true);
  try {
    const res = await apiPost({ action:'createPin', name: pickedChair.name, pin });
    if (res.success){
      saveSession({ name: pickedChair.name, room: res.room });
      showToast('PIN created. Welcome!');
      showAppScreen();
    } else {
      errEl.textContent = res.error || 'Could not create PIN.';
    }
  } catch(e){
    errEl.textContent = 'Network error — please try again.';
  } finally {
    setLoading(btn, false, 'Create PIN & continue');
  }
}

async function onLogin(){
  const pin = readPinInputs('enter');
  const errEl = $('#enter-pin-error');
  errEl.textContent = '';
  if (pin.length !== 4){ errEl.textContent = 'Enter all 4 digits.'; return; }

  const btn = $('#btn-login');
  setLoading(btn, true);
  try {
    const res = await apiPost({ action:'login', name: pickedChair.name, pin });
    if (res.success){
      saveSession({ name: pickedChair.name, room: res.room });
      showAppScreen();
    } else {
      errEl.textContent = res.error || 'Incorrect PIN.';
      clearPinInputs('enter');
      focusPinGroup('enter');
    }
  } catch(e){
    errEl.textContent = 'Network error — please try again.';
  } finally {
    setLoading(btn, false, 'Log in');
  }
}

// ============================================================ ROOM VIEW ===

async function goToRoomTab(){
  setActiveTab('room');
  await renderRoomView();
}

async function renderRoomView(){
  const root = $('#view-room');
  const roomInfo = CONFIG.ROOMS[session.room];
  root.innerHTML = `
    <div class="room-banner ${session.room}">
      <div class="room-tag">Room ${session.room}</div>
      <h2>${roomInfo.label}</h2>
      <div class="themes">${roomInfo.themes.join('<br>')}</div>
    </div>
    <p class="section-label">Presenters</p>
    <div id="presenter-list" class="presenter-list">
      <div class="center-loading"><span class="loader" style="border-color:#0002;border-top-color:var(--ink);"></span></div>
    </div>
  `;

  try {
    const [presRes, statusRes] = await Promise.all([
      apiGet({ action:'getPresenters', room: session.room }),
      apiGet({ action:'getMyAssessments', chair: session.name })
    ]);
    presentersCache = presRes.presenters || [];
    const statusByPresenter = {};
    (statusRes.assessments || []).forEach(a => statusByPresenter[a.presenterName] = a);

    const list = $('#presenter-list');
    if (presentersCache.length === 0){
      list.innerHTML = `<div class="empty-state">No presenters have been added to this room yet.<br>Ask the organiser to add them to the "Presenters" sheet tab.</div>`;
      return;
    }
    list.innerHTML = '';
    presentersCache.forEach(p => {
      const a = statusByPresenter[p.presenterName];
      const status = a ? a.status.toLowerCase() : 'none';
      const card = document.createElement('div');
      card.className = 'presenter-card';
      card.innerHTML = `
        <div class="core-sample">${renderCoreLayers(a ? a.scores : null)}</div>
        <div class="info">
          <div class="pname">${p.presenterName}</div>
          <div class="ptheme">${p.theme || ''}</div>
        </div>
        <div class="status-chip ${status}">${status==='none' ? 'Not scored' : status}</div>
      `;
      card.addEventListener('click', () => openAssessment(p));
      list.appendChild(card);
    });
  } catch(e){
    $('#presenter-list').innerHTML = `<div class="empty-state">Could not load presenters. Check your connection and try again.</div>`;
  }
}

function renderCoreLayers(scores){
  return CONFIG.CRITERIA.map(c => {
    const v = scores ? Number(scores[c.key])||0 : 0;
    const h = v ? (v/5*100) : 0;
    return `<div class="layer ${c.key}" style="height:${h/4}%"></div>`;
  }).join('');
}

// ======================================================== ASSESSMENT VIEW =

async function openAssessment(presenter){
  currentPresenter = presenter;
  currentScores = {};
  currentStatus = 'none';

  $('#view-room').classList.add('hidden');
  $('#view-results').classList.add('hidden');
  $('#view-assess').classList.remove('hidden');
  $('#tab-room').classList.remove('active');
  $('#tab-results').classList.remove('active');

  renderAssessmentSkeleton();

  // 1) try local draft cache first (instant, no flash of empty state)
  const cacheKey = DRAFT_PREFIX + session.name + '_' + presenter.presenterName;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (cached && cached.scores){
      currentScores = cached.scores;
      currentStatus = cached.status || 'draft';
      paintScores();
    }
  } catch(e){}

  // 2) reconcile with server (source of truth)
  try {
    const res = await apiGet({ action:'getAssessment', chair: session.name, presenter: presenter.presenterName });
    if (res.exists){
      currentScores = res.scores;
      currentStatus = res.status.toLowerCase();
      localStorage.setItem(cacheKey, JSON.stringify({ scores: currentScores, status: currentStatus }));
      paintScores();
    }
  } catch(e){ /* keep whatever we have locally */ }
}

function renderAssessmentSkeleton(){
  const root = $('#view-assess');
  root.innerHTML = `
    <button class="back-link" id="btn-back-room" style="margin-bottom:14px;">← Back to room</button>
    <div class="assess-header">
      <div>
        <h2>${currentPresenter.presenterName}</h2>
        <div class="ptheme">${currentPresenter.theme || ''} · Room ${currentPresenter.room}</div>
      </div>
    </div>

    <div id="criteria-wrap"></div>

    <div class="score-summary">
      <div class="core-sample" id="summary-core"></div>
      <div>
        <div class="total" id="summary-total">0<span>/${CONFIG.MAX_TOTAL}</span></div>
        <div class="sub" id="summary-sub">No ratings yet</div>
      </div>
    </div>

    <div class="save-row">
      <button class="btn btn-primary" id="btn-submit">Submit assessment</button>
    </div>
    <p class="autosave-note" id="autosave-note">Ratings save automatically as you go.</p>
  `;

  const wrap = $('#criteria-wrap');
  CONFIG.CRITERIA.forEach(c => {
    const block = document.createElement('div');
    block.className = 'criterion';
    block.innerHTML = `
      <div class="clabel">${c.label}</div>
      <div class="rating-row" data-key="${c.key}">
        ${[1,2,3,4,5].map(n => `<button class="rating-btn" data-val="${n}">${n}</button>`).join('')}
      </div>
      <div class="rating-scale-hint"><span>Poor</span><span>Excellent</span></div>
    `;
    wrap.appendChild(block);
  });

  $all('.rating-row').forEach(row => {
    const key = row.dataset.key;
    $all('.rating-btn', row).forEach(btn => {
      btn.addEventListener('click', () => {
        currentScores[key] = Number(btn.dataset.val);
        paintScores();
        autoSave(); // every tap saves — nothing is ever lost switching screens
      });
    });
  });

  $('#btn-back-room').addEventListener('click', goToRoomTab);
  $('#btn-submit').addEventListener('click', submitAssessment);
}

function paintScores(){
  CONFIG.CRITERIA.forEach(c => {
    const row = $(`.rating-row[data-key="${c.key}"]`);
    if (!row) return;
    $all('.rating-btn', row).forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.val) === currentScores[c.key]);
    });
  });

  const filled = CONFIG.CRITERIA.filter(c => currentScores[c.key]);
  const total = filled.reduce((s,c) => s + Number(currentScores[c.key]), 0);
  $('#summary-total').innerHTML = `${total}<span>/${CONFIG.MAX_TOTAL}</span>`;
  $('#summary-sub').textContent = filled.length === CONFIG.CRITERIA.length
    ? `Average ${(total/CONFIG.CRITERIA.length).toFixed(1)} / 5`
    : `${filled.length} of ${CONFIG.CRITERIA.length} criteria rated`;
  $('#summary-core').innerHTML = renderCoreLayers(currentScores);

  const submitBtn = $('#btn-submit');
  if (submitBtn){
    const allRated = filled.length === CONFIG.CRITERIA.length;
    submitBtn.disabled = !allRated;
    submitBtn.textContent = currentStatus === 'submitted' ? 'Update submission' : 'Submit assessment';
  }
}

let autoSaveTimer = null;
function autoSave(){
  // local cache, instant
  const cacheKey = DRAFT_PREFIX + session.name + '_' + currentPresenter.presenterName;
  localStorage.setItem(cacheKey, JSON.stringify({ scores: currentScores, status: currentStatus }));

  // server save (debounced slightly), keeps current status (draft stays draft,
  // submitted stays submitted-and-updated — see saveAssessment on the server)
  clearTimeout(autoSaveTimer);
  const note = $('#autosave-note');
  autoSaveTimer = setTimeout(async () => {
    const allRated = CONFIG.CRITERIA.every(c => currentScores[c.key]);
    if (!allRated) return; // wait until all 4 are rated before writing to the sheet
    try {
      const submitFlag = currentStatus === 'submitted';
      const res = await apiPost({
        action:'saveAssessment',
        chairName: session.name,
        room: currentPresenter.room,
        presenterName: currentPresenter.presenterName,
        scores: currentScores,
        submit: submitFlag
      });
      if (res.success){
        if (note){ note.textContent = 'Saved ✓'; note.classList.add('active'); }
        setTimeout(()=>{ if(note){ note.textContent='Ratings save automatically as you go.'; note.classList.remove('active'); } }, 1500);
      }
    } catch(e){ /* local cache already has it; will reconcile on next open */ }
  }, 450);
}

async function submitAssessment(){
  const allRated = CONFIG.CRITERIA.every(c => currentScores[c.key]);
  if (!allRated){ showToast('Rate all four criteria first.', true); return; }

  const btn = $('#btn-submit');
  setLoading(btn, true);
  try {
    const res = await apiPost({
      action:'saveAssessment',
      chairName: session.name,
      room: currentPresenter.room,
      presenterName: currentPresenter.presenterName,
      scores: currentScores,
      submit: true
    });
    if (res.success){
      currentStatus = 'submitted';
      const cacheKey = DRAFT_PREFIX + session.name + '_' + currentPresenter.presenterName;
      localStorage.setItem(cacheKey, JSON.stringify({ scores: currentScores, status: currentStatus }));
      showToast('Assessment submitted to the score sheet.');
      paintScores();
    } else {
      showToast(res.error || 'Could not submit. Try again.', true);
    }
  } catch(e){
    showToast('Network error — your ratings are saved on this device, retry when back online.', true);
  } finally {
    setLoading(btn, false);
    paintScores();
  }
}

// ============================================================ RESULTS ====

async function goToResultsTab(){
  currentPresenter = null;
  $('#view-room').classList.add('hidden');
  $('#view-assess').classList.add('hidden');
  $('#view-results').classList.remove('hidden');
  $('#tab-room').classList.remove('active');
  $('#tab-results').classList.add('active');
  await renderResultsView();
}

async function renderResultsView(){
  const root = $('#view-results');
  root.innerHTML = `
    <p class="section-label">Leaderboard — best oral presenter</p>
    <div class="results-toolbar" id="results-filters">
      ${['all','A','B','C'].map(r => `<button class="filter-chip ${r==='all'?'active':''}" data-room="${r}">${r==='all'?'All rooms':'Room '+r}</button>`).join('')}
    </div>
    <div id="results-list"><div class="center-loading"><span class="loader" style="border-color:#0002;border-top-color:var(--ink);"></span></div></div>
  `;

  $all('.filter-chip', root).forEach(chip => {
    chip.addEventListener('click', () => {
      resultsFilter = chip.dataset.room;
      $all('.filter-chip', root).forEach(c => c.classList.toggle('active', c===chip));
      paintResults(window._lastResults || []);
    });
  });

  try {
    const res = await apiGet({ action:'getResults' });
    window._lastResults = res.results || [];
    paintResults(window._lastResults);
  } catch(e){
    $('#results-list').innerHTML = `<div class="empty-state">Could not load results. Check your connection and try again.</div>`;
  }
}

function paintResults(results){
  const list = $('#results-list');
  const filtered = resultsFilter === 'all' ? results : results.filter(r => r.room === resultsFilter);
  if (filtered.length === 0){
    list.innerHTML = `<div class="empty-state">No submitted assessments yet for this filter.</div>`;
    return;
  }
  const medals = {1:'🥇',2:'🥈',3:'🥉'};
  list.innerHTML = filtered.map((r, idx) => {
    const rank = idx+1;
    const topClass = rank<=3 ? `top${rank}` : '';
    return `
      <div class="result-row ${topClass}">
        <div class="rank">${medals[rank] ? `<span class="medal">${medals[rank]}</span>` : rank}</div>
        <div class="rinfo">
          <div class="rname">${r.presenterName}</div>
          <div class="rmeta">Room ${r.room} · ${r.assessorsCount} assessor${r.assessorsCount===1?'':'s'}</div>
        </div>
        <div class="rscore">${r.averageTotal}<span>/${r.maxTotal}</span></div>
      </div>
    `;
  }).join('');
}

// ============================================================== BOOT =====

function init(){
  renderChairGrid();
  const existing = loadSession();
  if (existing){
    session = existing;
    showAppScreen();
  } else {
    showLoginScreen();
  }
}
